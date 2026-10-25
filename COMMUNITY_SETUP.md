# Comunidad de Toca Hierbas

La web usa el proyecto Supabase `toca-hierbas` (`rfcifojiysmiblyfeaer`) para cuentas, publicaciones y archivos. El esquema está en `supabase/schema.sql` y ya se aplicó al proyecto. Las tablas y el bucket `post-media` tienen RLS; el acceso al contenido requiere una comprobación reciente del servidor de Discord `1307129882215579749`.

## Configuración de las consolas

1. **Hecho:** En Supabase → Authentication → URL Configuration, **Site URL** es `https://toca-hierbas.vercel.app` y **Redirect URLs** incluye `https://toca-hierbas.vercel.app/comunidad.html`. La confirmación de correo está activada en Authentication → Providers → Email.
2. **Hecho:** La aplicación de Discord existente `toca hierbas web` (`1564028954086609066`) tiene `https://toca-hierbas.vercel.app/api/discord-callback` como redirect URI. El flujo solicita los scopes `identify` y `guilds.members.read`; no necesita bot.
3. **Parcial:** `DISCORD_CLIENT_ID` ya está en las variables de entorno **Production** de Vercel. Falta `DISCORD_CLIENT_SECRET` desde esa aplicación, guardado como variable cifrada.
4. En Supabase → Project Settings → API Keys, copiar una **secret key** a Vercel como `SUPABASE_SECRET_KEY`, cifrada y **solo para Production**. Es la clave actual que sustituye a la antigua `service_role` y tiene los mismos permisos elevados. Nunca ponerla en GitHub, en una preview ni en `public/`.
5. En Supabase → Authentication → Emails → SMTP Settings, configurar un servicio SMTP propio y un remitente verificado antes de invitar a miembros. El SMTP de prueba de Supabase no entrega correos a direcciones ajenas al equipo del proyecto.

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL`, `DISCORD_GUILD_ID` y `OAUTH_STATE_SECRET` ya están configuradas en Vercel para Production y Preview. El flujo OAuth usa la URL de producción; una preview con dominio distinto puede mostrar el diseño y el muro, pero la vinculación con Discord se comprueba en el dominio de producción.

## Desarrollo

`npm ci` instala versiones fijas. `npm run build` genera los archivos públicos. En local, usar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` antes de compilar. No guardar claves privadas en `public/`.

## Acceso

El usuario confirma su correo, inicia sesión y autoriza a Discord. Una función de Vercel comprueba su pertenencia al servidor y guarda un vínculo por 24 horas. Las políticas de Supabase bloquean publicaciones, comentarios, «me gusta» y archivos privados si la comprobación caduca. El usuario puede renovarla desde la página. Los archivos se sirven mediante enlaces firmados temporales.
