(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
};

/* ---------- Demo data (all examples) ---------- */
const CATS = { top: 'Верх', bottom: 'Низ', shoes: 'Обувь', layer: 'Верхний слой' };
const ITEMS = [
  { id: 't1', name: 'Белая футболка', cat: 'top', color: '#F2F2EE', season: 'лето' },
  { id: 't2', name: 'Зелёная рубашка', cat: 'top', color: '#2F5D50', season: 'всесезон' },
  { id: 't3', name: 'Серый свитер', cat: 'top', color: '#8A8F94', season: 'зима' },
  { id: 't4', name: 'Чёрная водолазка', cat: 'top', color: '#25262B', season: 'осень' },
  { id: 'b1', name: 'Синие джинсы', cat: 'bottom', color: '#3B5B8C', season: 'всесезон' },
  { id: 'b2', name: 'Бежевые брюки', cat: 'bottom', color: '#C9B79C', season: 'лето' },
  { id: 'b3', name: 'Чёрные брюки', cat: 'bottom', color: '#2A2A2E', season: 'всесезон' },
  { id: 'b4', name: 'Сливовая юбка миди', cat: 'bottom', color: '#7A4A63', season: 'весна' },
  { id: 's1', name: 'Белые кеды', cat: 'shoes', color: '#EFEFEA', season: 'лето' },
  { id: 's2', name: 'Чёрные ботинки', cat: 'shoes', color: '#1E1E1E', season: 'зима' },
  { id: 's3', name: 'Коричневые лоферы', cat: 'shoes', color: '#7B5238', season: 'осень' },
  { id: 'l1', name: 'Бежевый тренч', cat: 'layer', color: '#B9A27D', season: 'весна' },
  { id: 'l2', name: 'Чёрная куртка', cat: 'layer', color: '#2B2B30', season: 'зима' },
  { id: 'l3', name: 'Зелёный кардиган', cat: 'layer', color: '#4F7A62', season: 'осень' }
];
const SHOP_ITEMS = [
  { name: 'Лёгкая рубашка', shop: 'Демо-бутик «Лён»', cat: 'top', color: '#D9D3C3', price: '≈ 2 400 сом' },
  { name: 'Трикотажный топ', shop: 'Демо-бутик «Лён»', cat: 'top', color: '#6C8F83', price: '≈ 1 200 сом' },
  { name: 'Прямые джинсы', shop: 'Демо-магазин «Деним»', cat: 'bottom', color: '#44648F', price: '≈ 3 100 сом' },
  { name: 'Широкие брюки', shop: 'Демо-студия «Шерсть»', cat: 'bottom', color: '#3A3A40', price: '≈ 2 800 сом' },
  { name: 'Кожаные лоферы', shop: 'Демо-магазин «Деним»', cat: 'shoes', color: '#6E4A33', price: '≈ 5 500 сом' },
  { name: 'Городские кеды', shop: 'Демо-студия «Шерсть»', cat: 'shoes', color: '#E9E9E4', price: '≈ 3 600 сом' },
  { name: 'Шерстяной кардиган', shop: 'Демо-студия «Шерсть»', cat: 'layer', color: '#8D7A62', price: '≈ 4 200 сом' },
  { name: 'Лёгкий тренч', shop: 'Демо-бутик «Лён»', cat: 'layer', color: '#B8A586', price: '≈ 6 000 сом' }
];

/* ---------- Illustrations (original SVG) ---------- */
const P = {
  top: 'M62 84Q100 96 138 84L156 182 140 186 136 150V206H64V150L60 186 44 182Z',
  bottom: 'M64 202H136L143 332H108L100 244 92 332H57Z',
  shoes: 'M54 336H96L101 358H50ZM104 336H146L150 358H99Z',
  layer: 'M58 84L90 92 86 218H60L38 182ZM142 84L110 92 114 218H140L162 182Z'
};
const VB = { top: '36 76 128 140', bottom: '48 196 104 146', shoes: '44 330 112 34', layer: '30 76 140 150' };
const icon = (cat, color) => `<svg viewBox="${VB[cat]}" aria-hidden="true"><path d="${P[cat]}" fill="${color}" stroke="#17211E" stroke-opacity=".4" stroke-width="2"/></svg>`;
const man = c => {
  const p = k => `<path d="${P[k]}" fill="${c[k]}" stroke="#17211E" stroke-opacity=".4" stroke-width="2"/>`;
  return `<svg class="mannequin" viewBox="0 0 200 400" role="img" aria-label="Условный манекен с выбранным образом. Демонстрационный preview, не примерка">
<ellipse cx="100" cy="40" rx="22" ry="26" fill="#C5CEC9"/><path d="M90 62H110V86H90Z" fill="#C5CEC9"/>
${p('bottom')}${p('top')}${c.layer ? p('layer') : ''}${p('shoes')}<rect x="96" y="360" width="8" height="30" fill="#9AA7A1"/><rect x="70" y="388" width="60" height="6" rx="3" fill="#9AA7A1"/></svg>`;
};
const byId = id => ITEMS.find(i => i.id === id);
const outfit = sel => ({ top: byId(sel.top).color, bottom: byId(sel.bottom).color, shoes: byId(sel.shoes).color, layer: sel.layer && sel.layer !== 'none' ? byId(sel.layer).color : null });
const caption = sel => 'Образ: ' + ['top', 'bottom', 'shoes', 'layer'].filter(k => sel[k] && sel[k] !== 'none').map(k => byId(sel[k]).name.toLowerCase()).join(', ') + '.';

/* ---------- Form validation ---------- */
const setErr = (el, msg) => {
  const box = $('#err-' + el.id);
  if (box) box.textContent = msg ? 'Ошибка: ' + msg : '';
  el.classList.toggle('is-invalid', !!msg);
  msg ? el.setAttribute('aria-invalid', 'true') : el.removeAttribute('aria-invalid');
  return !msg;
};
const checkField = el => {
  const rules = (el.dataset.rule || '').split(' ');
  const isCheck = el.type === 'checkbox';
  const v = isCheck ? el.checked : el.type === 'file' ? '' : el.value.trim();
  let msg = '';
  if (rules.includes('required') && !v) msg = el.dataset.msg || 'заполните это поле.';
  else if (v && rules.includes('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'введите email в формате name@example.com.';
  else if (v && rules.includes('url')) { try { new URL(v); } catch { msg = 'введите ссылку целиком, например https://instagram.com/shop.'; } }
  if (el.type === 'file' && el.files[0]) {
    const f = el.files[0];
    if (!f.type.startsWith('image/')) msg = 'выберите файл изображения.';
    else if (f.size > 5 * 1024 * 1024) msg = 'файл больше 5 МБ.';
  }
  return setErr(el, msg);
};
const checkGroup = fs => {
  const min = +fs.dataset.min || 0;
  const n = $$('input:checked', fs).length;
  const box = $('#err-' + fs.id);
  const bad = n < min;
  if (box) box.textContent = bad ? 'Ошибка: ' + (fs.dataset.msg || 'выберите хотя бы один вариант.') : '';
  return !bad;
};
const validate = root => {
  let first = null;
  $$('[data-rule]', root).forEach(el => { if (!checkField(el) && !first) first = el; });
  $$('fieldset[data-min]', root).forEach(fs => { if (!checkGroup(fs) && !first) first = $('input', fs); });
  if (first) first.focus();
  return !first;
};
const say = (form, ok, text) => {
  const s = $('.status', form);
  s.className = 'status mt-3 alert ' + (ok ? 'alert-success' : 'alert-danger');
  s.textContent = (ok ? 'Готово: ' : 'Ошибка: ') + text;
};
$$('form[data-validate]').forEach(form => {
  form.dataset.t = Date.now();
  form.addEventListener('focusout', e => { if (e.target.dataset && e.target.dataset.rule) checkField(e.target); });
  form.addEventListener('change', e => { const fs = e.target.closest('fieldset[data-min]'); if (fs) checkGroup(fs); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const hp = $('[name=website]', form);
    if (hp && hp.value) return say(form, false, 'проверка на спам не пройдена. Заявка не отправлена.');
    if (!validate(form)) return say(form, false, 'исправьте отмеченные поля и отправьте форму снова.');
    if (hp && Date.now() - form.dataset.t < 3000) return say(form, false, 'форма отправлена слишком быстро. Подождите пару секунд и повторите.');
    if (form.id === 'add-form' && form._onValid) form._onValid(form);
    say(form, true, form.dataset.success);
    form.reset();
    form.dataset.t = Date.now();
  });
});

/* ---------- Home: hero preview ---------- */
const hero = $('[data-hero]');
if (hero) {
  const sel = { top: 't2', bottom: 'b1', shoes: 's1', layer: 'l1' };
  const draw = color => { const c = outfit(sel); if (color) c.top = color; hero.innerHTML = man(c); };
  draw();
  $$('[data-top]').forEach(b => b.addEventListener('click', () => { draw(b.dataset.top); $$('[data-top]').forEach(x => x.setAttribute('aria-pressed', x === b)); }));
}

/* ---------- Wardrobe ---------- */
const wg = $('#wgrid');
if (wg) {
  const items = ITEMS.map(i => ({ ...i }));
  const q = $('#wq'), fc = $('#wcat'), fs = $('#wseason'), empty = $('#wempty'), count = $('#wcount');
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const list = items.filter(i => (!fc.value || i.cat === fc.value) && (!fs.value || i.season === fs.value || i.season === 'всесезон') && i.name.toLowerCase().includes(t));
    wg.innerHTML = list.map(i => `<div class="col-6 col-md-4 col-xl-3"><article class="card-y tile h-100"><div class="icon">${i.img ? `<img src="${i.img}" alt="${esc(i.name)}">` : icon(i.cat, i.color)}</div><h3 class="mt-2 mb-1">${esc(i.name)}</h3><p class="small mb-2">${CATS[i.cat]}, ${i.season}</p><button type="button" class="btn btn-sm btn-outline-primary" data-del="${i.id}" aria-label="Удалить: ${esc(i.name)}">Удалить</button></article></div>`).join('');
    empty.hidden = list.length > 0;
    empty.textContent = items.length ? 'Ничего не найдено. Измените поиск или фильтры.' : 'Гардероб пуст. Добавьте первую вещь в форме ниже.';
    count.textContent = `Показано ${list.length} из ${items.length}`;
  };
  [q, fc, fs].forEach(el => el.addEventListener('input', draw));
  wg.addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (b) { const i = items.findIndex(x => x.id === b.dataset.del); items.splice(i, 1); draw(); $('#wq').focus(); } });
  const form = $('#add-form');
  form._onValid = f => {
    const d = new FormData(f), file = f.elements.photo.files[0];
    items.unshift({ id: 'u' + Date.now(), name: d.get('name').trim(), cat: d.get('cat'), color: d.get('color'), season: d.get('season') || 'всесезон', img: file ? URL.createObjectURL(file) : '' });
    draw();
  };
  draw();
}

/* ---------- Outfit Studio ---------- */
const studio = $('#studio');
if (studio) {
  const sel = { top: 't2', bottom: 'b1', shoes: 's1', layer: 'l1' };
  const stage = $('#stage'), cap = $('#cap'), favBox = $('#favs');
  Object.keys(CATS).forEach(cat => {
    const opts = ITEMS.filter(i => i.cat === cat).map(i => ({ id: i.id, name: i.name, color: i.color }));
    if (cat === 'layer') opts.push({ id: 'none', name: 'Без слоя', color: 'transparent' });
    $('#slot-' + cat).innerHTML = opts.map(o => `<input type="radio" class="btn-check" name="${cat}" id="r-${o.id}" value="${o.id}"><label class="btn btn-outline-primary btn-sm" for="r-${o.id}"><span class="dot" style="background:${o.color}"></span>${o.name}</label>`).join('');
  });
  const update = () => {
    Object.keys(sel).forEach(k => { $(`#r-${sel[k]}`).checked = true; });
    stage.innerHTML = man(outfit(sel));
    cap.textContent = caption(sel);
  };
  studio.addEventListener('change', e => { if (e.target.name in sel) { sel[e.target.name] = e.target.value; update(); } });
  const PRE = {
    'Учёба': { top: 't2', bottom: 'b1', shoes: 's1', layer: 'l3' },
    'Прогулка': { top: 't1', bottom: 'b2', shoes: 's3', layer: 'l1' },
    'Вечер': { top: 't4', bottom: 'b3', shoes: 's2', layer: 'none' }
  };
  $$('[data-preset]').forEach(b => b.addEventListener('click', () => { Object.assign(sel, PRE[b.dataset.preset]); update(); }));
  const drawFavs = () => {
    const favs = store.get('yw_favs', []);
    favBox.innerHTML = favs.length ? favs.map(f => `<li class="d-flex justify-content-between align-items-center gap-2 py-2 border-bottom"><span>${esc(caption(f.sel))}</span><button type="button" class="btn btn-sm btn-outline-primary" data-rm="${f.id}">Убрать</button></li>`).join('') : '<li class="py-2">Пока пусто. Соберите образ и нажмите «Сохранить в избранное».</li>';
  };
  $('#save').addEventListener('click', () => {
    const favs = store.get('yw_favs', []);
    favs.unshift({ id: Date.now(), sel: { ...sel } });
    store.set('yw_favs', favs.slice(0, 12));
    drawFavs();
    $('#save-status').textContent = 'Образ сохранён в избранное на этом устройстве.';
  });
  favBox.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { store.set('yw_favs', store.get('yw_favs', []).filter(f => String(f.id) !== b.dataset.rm)); drawFavs(); $('#save-status').textContent = 'Образ убран из избранного.'; } });
  update();
  drawFavs();
}

/* ---------- Style profile (steps) ---------- */
const pf = $('#profile');
if (pf) {
  const steps = $$('.step', pf), bar = $('.progress-bar', pf), label = $('#plabel');
  let n = 0;
  const show = i => {
    n = i;
    steps.forEach((s, k) => { s.hidden = k !== n; });
    const last = n === steps.length - 1, pct = last ? 100 : Math.round((n + 1) / (steps.length - 1) * 100);
    bar.style.width = pct + '%';
    $('.progress', pf).setAttribute('aria-valuenow', pct);
    label.textContent = last ? 'Готово' : `Шаг ${n + 1} из ${steps.length - 1}`;
    $('h2', steps[n]).focus();
  };
  const vals = name => $$(`input[name=${name}]:checked`, pf).map(i => i.value);
  const summary = () => {
    const data = { goals: vals('goals'), colors: vals('colors'), style: vals('style'), comfort: vals('comfort'), fit: vals('fit') };
    store.set('yw_profile', data);
    const rows = [['Цели', data.goals], ['Любимые цвета', data.colors], ['Стиль', data.style], ['Приоритет', data.comfort], ['Посадка', data.fit]];
    $('#p-summary').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v.length ? esc(v.join(', ')) : 'не указано'}</dd>`).join('');
  };
  pf.addEventListener('click', e => {
    const b = e.target.closest('button[data-nav]');
    if (!b) return;
    if (b.dataset.nav === 'next') {
      const fsReq = $('fieldset[data-min]', steps[n]);
      if (fsReq && !checkGroup(fsReq)) return $('input', fsReq).focus();
      if (n === steps.length - 2) summary();
      show(n + 1);
    } else if (b.dataset.nav === 'prev') show(n - 1);
    else show(0);
  });
  pf.addEventListener('change', e => { const fs = e.target.closest('fieldset[data-min]'); if (fs) checkGroup(fs); });
  steps.forEach((s, k) => { s.hidden = k !== 0; });
}

/* ---------- Shops ---------- */
const sg = $('#sgrid');
if (sg) {
  const q = $('#sq'), fc = $('#scat'), empty = $('#sempty'), count = $('#scount');
  const draw = () => {
    const t = q.value.trim().toLowerCase();
    const list = SHOP_ITEMS.filter(i => (!fc.value || i.cat === fc.value) && (i.name + ' ' + i.shop).toLowerCase().includes(t));
    sg.innerHTML = list.map(i => `<div class="col-6 col-lg-3"><article class="card-y tile h-100"><div class="icon">${icon(i.cat, i.color)}</div><span class="demo-badge mt-2">Демо-каталог</span><h3 class="mt-2 mb-1">${esc(i.name)}</h3><p class="small mb-1">${esc(i.shop)}</p><p class="mb-2">${i.price} <span class="small">(пример)</span></p><a class="btn btn-sm btn-outline-primary" href="#demo-note">Перейти в магазин (заглушка)</a></article></div>`).join('');
    empty.hidden = list.length > 0;
    count.textContent = `Показано ${list.length} из ${SHOP_ITEMS.length}`;
  };
  [q, fc].forEach(el => el.addEventListener('input', draw));
  draw();
}
})();
