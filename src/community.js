import { createClient } from '@supabase/supabase-js';

const config = window.TOCA_COMMUNITY_CONFIG || {};
const supabase = config.url && config.publishableKey
  ? createClient(config.url, config.publishableKey)
  : null;
const $ = (id) => document.getElementById(id);
const views = ['auth-view', 'discord-view', 'profile-view', 'community-view'];
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']);
const maxFileSize = 25 * 1024 * 1024;
let mode = 'login';
let recoveryMode = false;
let user = null;
let profile = null;
let membership = null;
let feedLoading = false;
let oldestPostTime = null;

function showView(id) {
  $('loading').hidden = true;
  for (const view of views) $(view).hidden = view !== id;
}

function message(text, error = false) {
  const target = $('global-message');
  target.textContent = text;
  target.classList.toggle('error', error);
  target.hidden = !text;
  if (text) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setMode(next) {
  mode = next;
  $('tab-login').classList.toggle('active', mode === 'login');
  $('tab-signup').classList.toggle('active', mode === 'signup');
  $('tab-login').setAttribute('aria-selected', String(mode === 'login'));
  $('tab-signup').setAttribute('aria-selected', String(mode === 'signup'));
  $('auth-title').textContent = mode === 'login' ? 'Qué bueno verte.' : 'Haz sitio en el prado.';
  $('auth-caption').textContent = mode === 'login' ? 'Entra para ver lo que está pasando.' : 'Te enviaremos un correo para confirmar tu cuenta.';
  $('auth-submit').firstChild.textContent = mode === 'login' ? 'Iniciar sesión ' : 'Crear mi cuenta ';
  $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('forgot-password').hidden = mode !== 'login';
  message('');
}

async function render() {
  if (!supabase) {
    showView('auth-view');
    $('auth-form').hidden = true;
    document.querySelector('.auth-tabs').hidden = true;
    message('La comunidad aún no está conectada a Supabase. Vuelve pronto.', true);
    return;
  }
  if (recoveryMode) {
    showView('auth-view');
    $('auth-form').hidden = true;
    $('reset-form').hidden = false;
    document.querySelector('.auth-tabs').hidden = true;
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    user = null;
    showView('auth-view');
    $('auth-form').hidden = false;
    $('reset-form').hidden = true;
    document.querySelector('.auth-tabs').hidden = false;
    return;
  }
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    await supabase.auth.signOut();
    showView('auth-view');
    return;
  }
  user = userData.user;
  const { data: link, error: linkError } = await supabase.from('discord_links')
    .select('checked_until').eq('user_id', user.id).maybeSingle();
  if (linkError) {
    message('No hemos podido comprobar tu acceso. Inténtalo de nuevo.', true);
    showView('discord-view');
    return;
  }
  membership = link;
  if (!link || new Date(link.checked_until).getTime() <= Date.now()) {
    $('discord-detail').textContent = link ? 'Tu comprobación ha caducado. Puedes renovarla en un clic.' : '';
    showView('discord-view');
    return;
  }
  const { data: foundProfile, error: profileError } = await supabase.from('profiles')
    .select('id,display_name').eq('id', user.id).maybeSingle();
  if (profileError) {
    message('No hemos podido cargar tu perfil. Inténtalo de nuevo.', true);
    showView('profile-view');
    return;
  }
  profile = foundProfile;
  if (!profile) {
    showView('profile-view');
    return;
  }
  $('composer-name').textContent = profile.display_name;
  $('composer-avatar').textContent = profile.display_name.slice(0, 1).toUpperCase();
  $('sidebar-name').textContent = profile.display_name;
  showView('community-view');
  await loadFeed();
}

async function startDiscord() {
  const button = $('connect-discord');
  button.disabled = true;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Inicia sesión de nuevo.');
    const response = await fetch('/api/discord-start', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No pudimos abrir Discord.');
    window.location.assign(data.url);
  } catch (error) {
    message(error.message, true);
    button.disabled = false;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

async function loadFeed(older = false) {
  if (feedLoading) return;
  feedLoading = true;
  $('feed-status').textContent = 'Cargando publicaciones…';
  $('load-more').disabled = true;
  try {
    let query = supabase.from('posts')
      .select('id,author_id,body,media_path,media_type,created_at,profiles(display_name)')
      .order('created_at', { ascending: false }).limit(30);
    if (older && oldestPostTime) query = query.lt('created_at', oldestPostTime);
    const { data: posts, error } = await query;
    if (error) throw error;
    const ids = posts.map((post) => post.id);
    const [likesResult, commentsResult] = ids.length ? await Promise.all([
      supabase.from('post_likes').select('post_id,user_id').in('post_id', ids),
      supabase.from('post_comments').select('id,post_id,author_id,body,created_at,profiles(display_name)').in('post_id', ids).order('created_at'),
    ]) : [{ data: [] }, { data: [] }];
    if (likesResult.error) throw likesResult.error;
    if (commentsResult.error) throw commentsResult.error;
    const likes = likesResult.data || [];
    const comments = commentsResult.data || [];
    const feed = $('feed');
    if (!older) feed.replaceChildren();
    if (!posts.length && !older) {
      const empty = make('div', 'empty-feed');
      empty.append(make('span', '', '✳'), make('h3', '', 'Aquí empieza todo.'), make('p', '', 'Sé la primera persona en compartir algo con el grupo.'));
      feed.append(empty);
    }
    const cards = await Promise.all(posts.map(async (post) => {
      const postLikes = likes.filter((like) => like.post_id === post.id);
      const postComments = comments.filter((comment) => comment.post_id === post.id);
      return renderPost(post, postLikes, postComments);
    }));
    feed.append(...cards);
    if (posts.length) oldestPostTime = posts.at(-1).created_at;
    else if (!older) oldestPostTime = null;
    $('load-more').hidden = posts.length < 30;
    const count = feed.querySelectorAll('.post').length;
    $('feed-status').textContent = count ? `${count} ${count === 1 ? 'publicación' : 'publicaciones'} mostradas` : '';
  } catch (error) {
    $('feed-status').textContent = 'No hemos podido cargar el muro.';
    message(error.message, true);
  } finally {
    feedLoading = false;
    $('load-more').disabled = false;
  }
}

async function renderPost(post, likes, comments) {
  const card = make('article', 'post');
  const header = make('div', 'post-header');
  const name = post.profiles?.display_name || 'Miembro';
  header.append(make('span', 'avatar', name.slice(0, 1).toUpperCase()));
  const identity = make('div');
  identity.append(make('strong', '', name), make('small', '', formatDate(post.created_at)));
  header.append(identity);
  if (post.author_id === user.id) {
    const remove = make('button', 'post-delete', 'Eliminar');
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!window.confirm('¿Eliminar esta publicación?')) return;
      remove.disabled = true;
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) {
        message(error.message, true);
        remove.disabled = false;
        return;
      }
      if (post.media_path) await supabase.storage.from('post-media').remove([post.media_path]);
      await loadFeed();
    });
    header.append(remove);
  }
  card.append(header);
  if (post.body) card.append(make('p', 'post-body', post.body));
  if (post.media_path) {
    const { data, error } = await supabase.storage.from('post-media').createSignedUrl(post.media_path, 600);
    if (!error && data?.signedUrl) {
      const media = make(post.media_type === 'video' ? 'video' : 'img', 'post-media');
      media.src = data.signedUrl;
      if (post.media_type === 'video') {
        media.controls = true;
        media.preload = 'metadata';
      } else {
        media.alt = `Imagen publicada por ${name}`;
        media.loading = 'lazy';
      }
      card.append(media);
    }
  }
  const actions = make('div', 'post-actions');
  const liked = likes.some((like) => like.user_id === user.id);
  const likeButton = make('button', liked ? 'liked' : '', `${liked ? '♥' : '♡'} ${likes.length} Me gusta`);
  likeButton.type = 'button';
  likeButton.addEventListener('click', async () => {
    likeButton.disabled = true;
    const query = liked
      ? supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      : supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    const { error } = await query;
    if (error) message(error.message, true);
    await loadFeed();
  });
  const commentLabel = make('span', '', `♧ ${comments.length} ${comments.length === 1 ? 'comentario' : 'comentarios'}`);
  actions.append(likeButton, commentLabel);
  card.append(actions);
  const commentsBox = make('div', 'comments');
  for (const comment of comments) {
    const row = make('div', 'comment');
    row.append(make('strong', '', comment.profiles?.display_name || 'Miembro'), document.createTextNode(comment.body));
    commentsBox.append(row);
  }
  const commentForm = make('form', 'comment-form');
  const input = make('input');
  input.type = 'text';
  input.maxLength = 1000;
  input.required = true;
  input.placeholder = 'Escribe un comentario…';
  input.setAttribute('aria-label', `Comentar la publicación de ${name}`);
  const send = make('button', '', 'Enviar');
  send.type = 'submit';
  commentForm.append(input, send);
  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = input.value.trim();
    if (!body) return;
    send.disabled = true;
    const { error } = await supabase.from('post_comments').insert({ post_id: post.id, author_id: user.id, body });
    if (error) { message(error.message, true); send.disabled = false; return; }
    await loadFeed();
  });
  commentsBox.append(commentForm);
  card.append(commentsBox);
  return card;
}

async function publish(event) {
  event.preventDefault();
  const body = $('post-body').value.trim();
  const file = $('post-file').files[0];
  if (!body && !file) return message('Escribe algo o añade una foto o vídeo.', true);
  if (file && (!allowedTypes.has(file.type) || file.size > maxFileSize)) {
    return message('Usa JPG, PNG, WebP, GIF, MP4 o WebM de hasta 25 MB.', true);
  }
  $('post-submit').disabled = true;
  let path = null;
  try {
    if (file) {
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm' }[file.type];
      path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('post-media').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
    }
    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      body,
      media_path: path,
      media_type: file ? (file.type.startsWith('video/') ? 'video' : 'image') : null,
    });
    if (error) throw error;
    $('post-body').value = '';
    $('post-file').value = '';
    $('file-preview').hidden = true;
    message('Publicado en el muro.');
    await loadFeed();
  } catch (error) {
    if (path) await supabase.storage.from('post-media').remove([path]);
    message(error.message, true);
  } finally {
    $('post-submit').disabled = false;
  }
}

function callbackMessage() {
  const status = new URLSearchParams(location.search).get('discord');
  if (!status) return;
  const messages = {
    ok: 'Discord verificado. ¡Bienvenido al prado!',
    no_miembro: 'No encontramos tu cuenta en el servidor de Toca Hierbas. Únete a Discord y vuelve a verificar.',
    discord_en_uso: 'Ese Discord ya está vinculado a otra cuenta.',
    cancelado: 'Has cancelado la conexión con Discord.',
    estado: 'La verificación ha caducado. Inténtalo de nuevo.',
    configuracion: 'La conexión con Discord aún no está configurada.',
    guardar: 'No hemos podido guardar la verificación. Inténtalo de nuevo.',
    discord: 'Discord no ha podido verificar tu cuenta. Inténtalo de nuevo.',
  };
  message(messages[status] || 'No hemos podido verificar Discord.', status !== 'ok');
  history.replaceState({}, '', location.pathname);
}

$('tab-login').addEventListener('click', () => setMode('login'));
$('tab-signup').addEventListener('click', () => setMode('signup'));
$('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const email = $('email').value.trim();
  const password = $('password').value;
  $('auth-submit').disabled = true;
  try {
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/comunidad.html` } });
      if (error) throw error;
      message('Revisa tu correo y pulsa el enlace de confirmación. Después podrás iniciar sesión.');
      setMode('login');
      message('Revisa tu correo y pulsa el enlace de confirmación. Después podrás iniciar sesión.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      message('');
      await render();
    }
  } catch (error) {
    message(error.message, true);
  } finally {
    $('auth-submit').disabled = false;
  }
});
$('forgot-password').addEventListener('click', async () => {
  if (!supabase) return;
  const email = $('email').value.trim();
  if (!email || !$('email').checkValidity()) return message('Escribe primero tu correo electrónico.', true);
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/comunidad.html?reset=1` });
  message(error ? error.message : 'Te hemos enviado un enlace para cambiar la contraseña.', Boolean(error));
});
$('reset-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const { error } = await supabase.auth.updateUser({ password: $('new-password').value });
  if (error) return message(error.message, true);
  recoveryMode = false;
  history.replaceState({}, '', location.pathname);
  message('Contraseña actualizada.');
  await render();
});
$('connect-discord').addEventListener('click', startDiscord);
$('recheck-discord').addEventListener('click', startDiscord);
$('profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const displayName = $('display-name').value.trim();
  if (displayName.length < 2 || displayName.length > 32) return message('El nombre debe tener entre 2 y 32 caracteres.', true);
  const { error } = await supabase.from('profiles').insert({ id: user.id, display_name: displayName });
  if (error) return message(error.message, true);
  message('Ya estás dentro. ¡Bienvenido!');
  await render();
});
$('post-form').addEventListener('submit', publish);
$('refresh-feed').addEventListener('click', () => loadFeed());
$('load-more').addEventListener('click', () => loadFeed(true));
$('post-file').addEventListener('change', () => {
  const file = $('post-file').files[0];
  $('file-preview').hidden = !file;
  $('file-preview').textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : '';
});
document.querySelectorAll('.sign-out').forEach((button) => button.addEventListener('click', async () => {
  await supabase.auth.signOut();
  message('Has cerrado sesión.');
  await render();
}));

if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      recoveryMode = true;
      render();
    }
  });
}
callbackMessage();
render().catch((error) => {
  showView('auth-view');
  message(error.message, true);
});
