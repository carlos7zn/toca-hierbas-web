const { createHmac, timingSafeEqual } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');

function redirect(res, reason) {
  const url = new URL('/comunidad.html', process.env.SITE_URL || 'https://toca-hierbas.vercel.app');
  url.searchParams.set('discord', reason);
  return res.redirect(303, url.toString());
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', 'toca_oauth=; HttpOnly; Secure; SameSite=Lax; Path=/api/discord-callback; Max-Age=0');
  if (req.method !== 'GET') return res.status(405).end();
  if (!process.env.OAUTH_STATE_SECRET || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.DISCORD_CLIENT_SECRET) {
    return redirect(res, 'configuracion');
  }

  try {
    const cookie = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('toca_oauth='));
    if (!cookie || !req.query.code || !req.query.state) return redirect(res, 'cancelado');
    const [payload, signature] = cookie.slice('toca_oauth='.length).split('.');
    if (!payload || !signature) return redirect(res, 'estado');
    const expected = createHmac('sha256', process.env.OAUTH_STATE_SECRET).update(payload).digest('base64url');
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return redirect(res, 'estado');
    const state = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (state.expires < Date.now() || state.state !== req.query.state || !/^[0-9a-f-]{36}$/.test(state.userId)) {
      return redirect(res, 'estado');
    }

    const redirectUri = new URL('/api/discord-callback', process.env.SITE_URL).toString();
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenResponse.ok) return redirect(res, 'discord');
    const token = await tokenResponse.json();
    const headers = { Authorization: `Bearer ${token.access_token}` };
    const [meResponse, memberResponse] = await Promise.all([
      fetch('https://discord.com/api/v10/users/@me', { headers }),
      fetch(`https://discord.com/api/v10/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, { headers }),
    ]);
    if (!meResponse.ok) return redirect(res, 'discord');
    const me = await meResponse.json();
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (!memberResponse.ok) {
      await supabase.from('discord_links').delete().eq('user_id', state.userId);
      return redirect(res, 'no_miembro');
    }
    const member = await memberResponse.json();
    if (member.user?.id !== me.id) return redirect(res, 'discord');

    const { error } = await supabase.from('discord_links').upsert({
      user_id: state.userId,
      discord_id: me.id,
      checked_at: new Date().toISOString(),
      checked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return redirect(res, error.code === '23505' ? 'discord_en_uso' : 'guardar');
    return redirect(res, 'ok');
  } catch (error) {
    console.error('Discord membership verification failed:', error);
    return redirect(res, 'discord');
  }
};
