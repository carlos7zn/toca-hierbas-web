const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY', 'DISCORD_GUILD_ID']
    .every((key) => Boolean(process.env[key]))) {
    return res.status(503).json({ error: 'La comprobación de Discord aún no está configurada.' });
  }

  const bearer = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const providerToken = req.body?.providerToken;
  if (!bearer || typeof providerToken !== 'string' || !providerToken || providerToken.length > 4096) {
    return res.status(401).json({ error: 'Vuelve a entrar con Discord.' });
  }

  try {
    const auth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await auth.auth.getUser(bearer[1]);
    if (userError || !user) return res.status(401).json({ error: 'La sesión ha caducado.' });

    const identity = user.identities?.find((item) => item.provider === 'discord');
    const discordId = identity?.provider_id || identity?.id;
    if (!discordId) return res.status(403).json({ error: 'Entra con una cuenta de Discord.' });

    const headers = { Authorization: `Bearer ${providerToken}` };
    const meResponse = await fetch('https://discord.com/api/v10/users/@me', { headers });
    if (!meResponse.ok) return res.status(401).json({ error: 'Vuelve a autorizar Discord.' });
    const me = await meResponse.json();
    if (me.id !== discordId) return res.status(403).json({ error: 'La cuenta de Discord no coincide con tu sesión.' });

    const memberResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`, { headers });
    const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (memberResponse.status === 404) {
      await admin.from('discord_links').delete().eq('user_id', user.id);
      return res.status(403).json({ error: 'Tu Discord no está en el servidor de Toca Hierbas.' });
    }
    if (!memberResponse.ok) return res.status(403).json({ error: 'Autoriza la comprobación del servidor en Discord.' });
    const member = await memberResponse.json();
    if (member.user?.id !== me.id) return res.status(403).json({ error: 'No pudimos comprobar tu cuenta de Discord.' });

    const { error } = await admin.from('discord_links').upsert({
      user_id: user.id,
      discord_id: me.id,
      checked_at: new Date().toISOString(),
      checked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'user_id' });
    if (error) return res.status(500).json({ error: 'No pudimos guardar tu acceso. Inténtalo de nuevo.' });
    return res.status(200).json({ verified: true });
  } catch (error) {
    console.error('Discord membership verification failed:', error);
    return res.status(502).json({ error: 'Discord no ha respondido. Inténtalo de nuevo.' });
  }
};
