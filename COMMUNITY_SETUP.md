# Comunidad de Toca Hierbas

La web usa el proyecto Supabase `toca-hierbas` (`rfcifojiysmiblyfeaer`) para cuentas, publicaciones y archivos. El esquema está en `supabase/schema.sql` y ya se aplicó al proyecto. Las tablas y el bucket `post-media` tienen RLS; el acceso al contenido requiere una comprobación reciente del servidor de Discord `1307129882215579749`.

## Configuración de las consolas

1. **Hecho:** En Supabase → Authentication → URL Configuration, **Site URL** es `https://toca-hierbas.vercel.app` y **Redirect URLs** incluye `https://toca-hierbas.vercel.app/comunidad.html`.
2. **Pendiente:** Activar el proveedor Discord en Supabase Auth con la aplicación `toca hierbas web` (`1564028954086609066`) y añadir `https://rfcifojiysmiblyfeaer.supabase.co/auth/v1/callback` a sus redirects. El acceso solicita `identify` y `guilds.members.read`; no necesita bot.
3. **Pendiente:** Desactivar el proveedor de acceso por correo en Supabase Auth cuando Discord funcione, para que no haya un segundo método de registro sin la misma comprobación de identidad.
4. **Hecho:** Una **secret key** de Supabase está en Vercel como `SUPABASE_SECRET_KEY`, tipo Secret y **solo para Production**. Es la clave actual que sustituye a la antigua `service_role` y tiene los mismos permisos elevados. Nunca ponerla en GitHub, en una preview ni en `public/`.

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL` y `DISCORD_GUILD_ID` ya están configuradas en Vercel para Production y Preview. El acceso OAuth se redirige al dominio de producción; una preview con dominio distinto puede mostrar el diseño, pero el recorrido completo debe probarse en producción.

La comunidad está en la rama `feat/comunidad-supabase`. Ya no necesita SMTP ni dominio propio: la cuenta se crea al entrar con Discord y el servidor comprueba la pertenencia antes de dar acceso. Probar el recorrido completo de entrada, comprobación y publicación antes de activar la nueva versión de la web.

## Desarrollo

`npm ci` instala versiones fijas. `npm run build` genera los archivos públicos. En local, usar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` antes de compilar. No guardar claves privadas en `public/`.

## Acceso

El usuario entra con Discord mediante Supabase Auth. Una función de Vercel compara esa identidad con el token de Discord y comprueba su pertenencia al servidor; el vínculo dura 24 horas. Las políticas de Supabase bloquean publicaciones, comentarios, «me gusta» y archivos privados si la comprobación caduca. El usuario puede renovarla desde la página. Los archivos se sirven mediante enlaces firmados temporales.
