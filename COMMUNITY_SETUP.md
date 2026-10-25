# Comunidad de Toca Hierbas

La web usa el proyecto Supabase `toca-hierbas` (`rfcifojiysmiblyfeaer`) para cuentas, publicaciones y archivos. El esquema está en `supabase/schema.sql` y ya se aplicó al proyecto. Las tablas y el bucket `post-media` tienen RLS; el acceso al contenido requiere una comprobación reciente del servidor de Discord `1307129882215579749`.

## Configuración pendiente en las consolas

1. En Supabase → Authentication → URL Configuration, poner **Site URL** en `https://toca-hierbas.vercel.app` y añadir `https://toca-hierbas.vercel.app/comunidad.html` a **Redirect URLs**. Mantener activada la confirmación de correo en Authentication → Providers → Email.
2. En Discord Developer Portal, crear una aplicación para Toca Hierbas. En OAuth2, añadir exactamente `https://toca-hierbas.vercel.app/api/discord-callback` como redirect URI. El flujo solicita los scopes `identify` y `guilds.members.read`; no necesita bot.
3. En las variables de entorno del proyecto Vercel `toca-hierbas`, añadir `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET` desde esa aplicación. Guardar el secreto como variable cifrada.
4. En Supabase → Project Settings → API Keys, copiar la **service role key** a Vercel como `SUPABASE_SERVICE_ROLE_KEY`, cifrada. Nunca poner esa clave en GitHub ni en `public/`.

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL`, `DISCORD_GUILD_ID` y `OAUTH_STATE_SECRET` ya están configuradas en Vercel para Production y Preview. El flujo OAuth usa la URL de producción; una preview con dominio distinto puede mostrar el diseño y el muro, pero la vinculación con Discord se comprueba en el dominio de producción.

## Desarrollo

`npm ci` instala versiones fijas. `npm run build` genera los archivos públicos. En local, usar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` antes de compilar. No guardar claves privadas en `public/`.

## Acceso

El usuario confirma su correo, inicia sesión y autoriza a Discord. Una función de Vercel comprueba su pertenencia al servidor y guarda un vínculo por 24 horas. Las políticas de Supabase bloquean publicaciones, comentarios, «me gusta» y archivos privados si la comprobación caduca. El usuario puede renovarla desde la página. Los archivos se sirven mediante enlaces firmados temporales.
