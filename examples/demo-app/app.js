// Demo Inventory — a tiny client-side app to capture a manual from. No server logic: any password signs in,
// the role comes from the email ("editor…" = Editor, anything else = Viewer), data lives in sessionStorage.
const M = await (await fetch('messages.json')).json();
const t = (key, vars = {}) => key.split('.').reduce((o, k) => o[k], M)
  .replace(/\{count, plural, one \{# item\} other \{# items\}\}/, vars.count === 1 ? '1 item' : `${vars.count} items`)
  .replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const page = document.body.dataset.page;
const user = sessionStorage.getItem('user');
const role = user?.toLowerCase().startsWith('editor') ? 'editor' : 'viewer';

const SEED = [
  { id: 1, name: 'Standing desk', category: 'office', quantity: 12, notes: '' },
  { id: 2, name: 'USB-C dock', category: 'hardware', quantity: 3, notes: '' },
  { id: 3, name: 'Office chair', category: 'office', quantity: 0, notes: '' },
  { id: 4, name: 'Design tool licence', category: 'software', quantity: 25, notes: '' },
  { id: 5, name: '27-inch monitor', category: 'hardware', quantity: 8, notes: '' },
  { id: 6, name: 'Whiteboard', category: 'office', quantity: 2, notes: '' },
];
const items = () => JSON.parse(sessionStorage.getItem('items') ?? JSON.stringify(SEED));
const statusOf = (q) => (q === 0 ? 'out' : q < 5 ? 'low' : 'inStock');

function shell(inner) {
  document.title = t('app.name');
  return `<header class="bar"><strong>${t('app.name')}</strong>
    <nav><a href="items.html">${t('app.nav.items')}</a></nav>
    <span class="who">${esc(user)} <span class="role">${t('roles.' + role)}</span></span>
    <button id="signout" class="link">${t('app.signOut')}</button></header><main>${inner}</main>`;
}

if (page !== 'login' && !user) location.replace('index.html');

if (page === 'login') {
  $('#app').innerHTML = `<main class="login"><form id="login" class="card">
    <h1>${t('login.title')}</h1>
    <label for="email">${t('login.email')}</label><input id="email" type="email" required autocomplete="username">
    <label for="password">${t('login.password')}</label><input id="password" type="password" required autocomplete="current-password">
    <button type="submit" class="primary">${t('login.submit')}</button><p class="muted">${t('login.hint')}</p></form></main>`;
  $('#login').addEventListener('submit', (e) => {
    e.preventDefault();
    sessionStorage.setItem('user', $('#email').value.trim());
    location.href = 'items.html';
  });
}

if (page === 'list') {
  $('#app').innerHTML = shell(`<div class="head"><h1>${t('list.title')}</h1>
    ${role === 'editor' ? `<a class="primary btn" href="item.html">${t('list.new')}</a>` : ''}</div>
    <div class="toolbar"><label for="q">${t('list.search')}</label>
      <input id="q" type="search" placeholder="${t('list.searchPlaceholder')}"><span id="count" class="muted"></span></div>
    <table><thead><tr>${['name', 'category', 'quantity', 'status'].map((c) => `<th>${t('list.columns.' + c)}</th>`).join('')}</tr></thead>
    <tbody id="rows"></tbody></table><p id="empty" class="muted" hidden>${t('list.empty')}</p>`);
  const render = () => {
    const q = $('#q').value.trim().toLowerCase();
    const rows = items().filter((it) => !q || it.name.toLowerCase().includes(q) || t('categories.' + it.category).toLowerCase().includes(q));
    $('#rows').innerHTML = rows.map((it) => `<tr data-id="${it.id}"><td><a href="item.html?id=${it.id}">${esc(it.name)}</a></td>
      <td>${t('categories.' + it.category)}</td><td class="num">${it.quantity}</td>
      <td><span class="status ${statusOf(it.quantity)}">${t('status.' + statusOf(it.quantity))}</span></td></tr>`).join('');
    $('#count').textContent = t('list.count', { count: rows.length });
    $('#empty').hidden = rows.length > 0;
  };
  $('#q').addEventListener('input', render);
  render();
  const saved = new URLSearchParams(location.search).get('saved');
  if (saved) {
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t('list.saved', { name: saved });
    document.body.append(el);
    setTimeout(() => el.remove(), 6000);
  }
}

if (page === 'form') {
  const id = Number(new URLSearchParams(location.search).get('id'));
  const it = items().find((x) => x.id === id) ?? { name: '', category: 'hardware', quantity: 0, notes: '' };
  const ro = role !== 'editor';
  const dis = ro ? 'disabled' : '';
  $('#app').innerHTML = shell(`<div class="head"><h1>${t(id ? 'form.detailTitle' : 'form.newTitle')}</h1></div>
    ${ro ? `<p class="note">${t('form.readOnly')}</p>` : ''}
    <form id="item" class="card form" novalidate>
      <div class="field" id="f-name"><label for="name">${t('form.name')}</label><input id="name" value="${esc(it.name)}" ${dis}>
        <span class="error" id="name-error" hidden>${t('form.nameRequired')}</span></div>
      <div class="field" id="f-category"><label for="category">${t('form.category')}</label><select id="category" ${dis}>
        ${['hardware', 'software', 'office'].map((c) => `<option value="${c}" ${c === it.category ? 'selected' : ''}>${t('categories.' + c)}</option>`).join('')}</select></div>
      <div class="field" id="f-quantity"><label for="quantity">${t('form.quantity')}</label><input id="quantity" type="number" min="0" value="${it.quantity}" ${dis}></div>
      <div class="field" id="f-notes"><label for="notes">${t('form.notes')}</label><textarea id="notes" rows="3" ${dis}>${esc(it.notes)}</textarea></div>
      <div class="actions">${ro ? '' : `<button type="submit" class="primary">${t('form.save')}</button>`}
        <a href="items.html" class="btn">${ro ? t('form.back') : t('form.cancel')}</a></div></form>`);
  $('#item').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    $('#name-error').hidden = !!name;
    if (!name) return;
    const all = items();
    const rec = { id: id || Math.max(0, ...all.map((x) => x.id)) + 1, name, category: $('#category').value,
      quantity: Number($('#quantity').value) || 0, notes: $('#notes').value };
    sessionStorage.setItem('items', JSON.stringify(id ? all.map((x) => (x.id === id ? rec : x)) : [...all, rec]));
    location.href = 'items.html?saved=' + encodeURIComponent(name);
  });
}

$('#signout')?.addEventListener('click', () => { sessionStorage.clear(); location.href = 'index.html'; });
$('.loading')?.remove();
