const { randomBytes, createHmac } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');

function configured() {
  return ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'DISCORD_GUILD_ID', 'OAUTH_STATE_SECRET', 'SITE_URL']
    .every((key) => Boolean(process.env[key]));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!configured()) return res.status(503).json({ error: 'La conexión con Discord aún no está configurada.' });

  const bearer = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!bearer) return res.status(401).json({ error: 'Inicia sesión primero.' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await supabase.auth.getUser(bearer[1]);
  if (error || !user) return res.status(401).json({ error: 'La sesión ha caducado.' });
  if (!user.email_confirmed_at) return res.status(403).json({ error: 'Confirma tu correo antes de vincular Discord.' });

  const state = randomBytes(24).toString('hex');
  const payload = Buffer.from(JSON.stringify({ userId: user.id, state, expires: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', process.env.OAUTH_STATE_SECRET).update(payload).digest('base64url');
  const cookie = `${payload}.${signature}`;
  res.setHeader('Set-Cookie', `toca_oauth=${cookie}; HttpOnly; Secure; SameSite=Lax; Path=/api/discord-callback; Max-Age=600`);

  const redirectUri = new URL('/api/discord-callback', process.env.SITE_URL).toString();
  const url = new URL('https://discord.com/oauth2/authorize');
  url.search = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify guilds.members.read',
    state,
    prompt: 'consent',
  }).toString();
  return res.status(200).json({ url: url.toString() });
};
