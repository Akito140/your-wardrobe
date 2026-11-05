import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
NAV=[("index","Главная"),("how-it-works","Как это работает"),("style-profile","Профиль стиля"),("wardrobe","Гардероб"),("outfit-studio","Студия образов"),("shops","Магазины"),("faq","FAQ"),("contact","Контакты")]
NOJS='<noscript><div class="alert alert-warning">Для этой функции нужен JavaScript. Включите его в браузере, чтобы попробовать демо.</div></noscript>'
DEMO='<div class="alert alert-secondary" role="note">Это демонстрационный MVP: данные и рекомендации являются примерами. Мы не анализируем внешность, не делаем 3D-сканирование и не гарантируем точную посадку.</div>'

def page(name,title,body):
    links=''.join(f'<li class="nav-item"><a class="nav-link{" active" if k==name else ""}" href="{k}.html"{" aria-current=\"page\"" if k==name else ""}>{t}</a></li>' for k,t in NAV)
    cur=' aria-current="page"' if name=="join" else ''
    html=f'''<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Your Wardrobe</title>
<meta name="description" content="Your Wardrobe — AI Stylist: демонстрационный MVP цифрового гардероба и сборки образов.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;600&family=Unbounded:wght@500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="assets/css/styles.css" rel="stylesheet"></head>
<body><a class="skip" href="#main">К содержимому</a>
<header><nav class="navbar navbar-expand-xl fixed-top" aria-label="Основная навигация"><div class="container">
<a class="navbar-brand brand" href="index.html">Your Wardrobe</a>
<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Открыть меню"><span class="navbar-toggler-icon"></span></button>
<div class="collapse navbar-collapse" id="nav"><ul class="navbar-nav me-auto">{links}</ul>
<a class="btn btn-primary" href="join.html"{cur}>Записаться на пилот</a></div></div></nav></header>
<main id="main">{body}</main>
<footer><div class="container"><div class="row g-4">
<div class="col-md-5"><p class="brand mb-2">Your Wardrobe — AI Stylist</p><p class="small">Твой гардероб. Твой стиль. Без лишних покупок. Учебный демо-MVP: все товары, цены и магазины — примеры.</p></div>
<div class="col-6 col-md-3"><p class="fw-semibold mb-1">Разделы</p><ul class="list-unstyled small mb-0">{''.join(f'<li><a href="{k}.html">{t}</a></li>' for k,t in NAV[1:6])}</ul></div>
<div class="col-6 col-md-4"><p class="fw-semibold mb-1">Контакты</p><p class="small mb-1"><a href="mailto:hello@example.com">hello@example.com</a> (демо-адрес)</p><p class="small mb-0"><a href="faq.html#privacy">Политика конфиденциальности (демо)</a></p></div>
</div></div></footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/main.js"></script></body></html>'''
    open(f'{name}.html','w',encoding='utf-8').write(html)

def fld(f,n,label,t='text',rule='',hint='',tag='input',opts=(),extra=''):
    i=f'{f}-{n}'; d=f'err-{i}'+(f' h-{i}' if hint else '')
    req='обязательно' if 'required' in rule else 'необязательно'
    a=f'id="{i}" name="{n}" data-rule="{rule}" aria-describedby="{d}" {extra}'
    if tag=='textarea': c=f'<textarea class="form-control" {a} rows="4"></textarea>'
    elif tag=='select': c=f'<select class="form-select" {a}><option value="">Выберите</option>'+''.join(f'<option>{o}</option>' for o in opts)+'</select>'
    else: c=f'<input type="{t}" class="form-control" {a}>'
    h=f'<div id="h-{i}" class="form-text">{hint}</div>' if hint else ''
    return f'<div class="mb-3"><label class="form-label" for="{i}">{label} <span class="small">({req})</span></label>{c}{h}<div id="err-{i}" class="invalid-msg"></div></div>'

def grp(f,n,legend,opts,mn=0,t='checkbox',msg=''):
    i=f'g-{f}-{n}'; req='обязательно' if mn else 'необязательно'
    chips=''.join(f'<input type="{t}" class="btn-check" name="{n}" id="{f}-{n}-{k}" value="{o}"><label class="btn btn-outline-primary btn-sm" for="{f}-{n}-{k}">{o}</label>' for k,o in enumerate(opts))
    m=f' data-msg="{msg}"' if msg else ''
    return f'<fieldset class="mb-3" id="{i}" data-min="{mn}"{m} aria-describedby="err-{i}"><legend class="fs-6 fw-semibold">{legend} <span class="small fw-normal">({req})</span></legend><div class="d-flex flex-wrap gap-2">{chips}</div><div id="err-{i}" class="invalid-msg"></div></fieldset>'

def consent(f):
    return f'<div class="mb-3"><div class="form-check"><input class="form-check-input" type="checkbox" id="{f}-ok" name="consent" data-rule="required" data-msg="подтвердите согласие." aria-describedby="err-{f}-ok"><label class="form-check-label" for="{f}-ok">Согласен(на) на обработку заявки. <a href="faq.html#privacy">Политика конфиденциальности</a> (демо).</label></div><div id="err-{f}-ok" class="invalid-msg"></div></div>'

HP='<div class="hp" aria-hidden="true"><label>Не заполняйте это поле <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>'
def form(fid,ok,inner,btn):
    return f'<form id="{fid}" data-validate novalidate data-success="{ok}">{HP}{inner}<button class="btn btn-primary" type="submit">{btn}</button><div class="status mt-3" role="status" aria-live="polite"></div></form>'

# ---- pages ----
page("index","Главная",f'''<section class="section"><div class="container"><div class="row align-items-center g-5">
<div class="col-lg-7"><h1>Твой гардероб. Твой стиль. Без лишних покупок.</h1>
<p class="lead mt-3">Your Wardrobe помогает собирать образы из вещей, которые у вас уже есть, и находить дополнения у локальных магазинов Кыргызстана.</p>
<p>Сейчас это демонстрация идеи: образы вы собираете сами, а рекомендации на базе AI — задача следующих версий.</p>
<div class="d-flex flex-wrap gap-2 mt-4"><a class="btn btn-primary btn-lg" href="style-profile.html">Создать профиль стиля</a><a class="btn btn-outline-primary btn-lg" href="how-it-works.html">Посмотреть, как это работает</a></div></div>
<div class="col-lg-5"><div class="stage" data-hero><p class="mb-0">Пример образа на условном манекене.</p></div>
<div class="d-flex flex-wrap gap-2 justify-content-center mt-3" role="group" aria-label="Цвет верха в примере">
<button type="button" class="btn btn-outline-primary btn-sm" data-top="#F2F2EE" aria-pressed="false">Белый</button><button type="button" class="btn btn-outline-primary btn-sm" data-top="#2F5D50" aria-pressed="false">Зелёный</button><button type="button" class="btn btn-outline-primary btn-sm" data-top="#8A8F94" aria-pressed="false">Серый</button><button type="button" class="btn btn-outline-primary btn-sm" data-top="#7A4A63" aria-pressed="false">Сливовый</button></div></div>
</div></div></section>
<section class="section"><div class="container"><h2 class="mb-4">Что можно попробовать</h2><div class="row g-3">
<div class="col-md-6 col-lg-3"><article class="card-y h-100"><h3>Профиль стиля</h3><p>Короткая анкета: цели, цвета, комфорт. Любые вопросы можно пропустить.</p><a href="style-profile.html">Заполнить анкету</a></article></div>
<div class="col-md-6 col-lg-3"><article class="card-y h-100"><h3>Цифровой гардероб</h3><p>Вещи в карточках, поиск и фильтры по категории и сезону.</p><a href="wardrobe.html">Открыть гардероб</a></article></div>
<div class="col-md-6 col-lg-3"><article class="card-y h-100"><h3>Студия образов</h3><p>Выберите верх, низ, обувь и слой, и посмотрите образ на манекене.</p><a href="outfit-studio.html">Собрать образ</a></article></div>
<div class="col-md-6 col-lg-3"><article class="card-y h-100"><h3>Локальные магазины</h3><p>Демо-каталог: так могли бы выглядеть товары бутиков в одном месте.</p><a href="shops.html">Смотреть каталог</a></article></div>
</div></div></section>
<section class="section"><div class="container">{DEMO}</div></section>''')

page("how-it-works","Как это работает",'''<section class="section"><div class="container"><h1>Как это работает</h1><p class="lead mt-3">Четыре шага от предпочтений до готового образа. Сначала вещи, которые у вас уже есть, и только потом идеи для покупок.</p>
<ol class="steps mt-4"><li><div><h2 class="h5">Расскажите о предпочтениях</h2><p class="mb-1">Цели, любимые цвета и желаемая посадка. Мерки, вес и фото не нужны.</p><a href="style-profile.html">Заполнить анкету</a></div></li>
<li><div><h2 class="h5">Добавьте вещи в гардероб</h2><p class="mb-1">Выберите из примеров или добавьте свою вещь, фото остаётся в вашем браузере.</p><a href="wardrobe.html">Открыть гардероб</a></div></li>
<li><div><h2 class="h5">Соберите капсулу</h2><p class="mb-1">Комбинируйте вещи в студии и сохраняйте удачные образы в избранное.</p><a href="outfit-studio.html">Открыть студию</a></div></li>
<li><div><h2 class="h5">Найдите дополнения в магазинах</h2><p class="mb-1">Демо-каталог показывает, как товары локальных бутиков могли бы встраиваться в образ.</p><a href="shops.html">Смотреть каталог</a></div></li></ol>
<div class="row g-3 mt-3"><div class="col-md-6"><div class="card-y h-100"><h2 class="h5">Что есть в демо</h2><p class="mb-0">Анкета, гардероб с фильтрами, конструктор образов, демо-каталог, формы заявок.</p></div></div>
<div class="col-md-6"><div class="card-y h-100"><h2 class="h5">Чего пока нет</h2><p class="mb-0">Работающего AI, 3D-аватара, точной примерки, подбора размера, корзины и оплаты.</p></div></div></div></div></section>''')

step=lambda h,inner,nav:f'<div class="step"><h2 class="h4 mb-3" tabindex="-1">{h}</h2>{inner}<div class="d-flex gap-2 mt-3">{nav}</div></div>'
NB='<button type="button" class="btn btn-outline-primary" data-nav="prev">Назад</button>'
page("style-profile","Профиль стиля",f'''<section class="section"><div class="container" style="max-width:760px"><h1>Профиль стиля</h1><p class="mt-3">Три коротких шага. Обязателен только первый, остальное можно пропустить. Мы не просим мерки, вес или фото.</p>{NOJS}
<div id="profile" class="card-y"><p id="plabel" class="mb-1 fw-semibold" aria-live="polite">Шаг 1 из 3</p><div class="progress mb-4" role="progressbar" aria-label="Прогресс анкеты" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:33%"></div></div>
{step("Для чего вам образы?",grp("p","goals","Цели использования",["Повседневные образы","Учёба или работа","Мероприятия","Путешествия","Другое"],1,msg="выберите хотя бы одну цель."),'<button type="button" class="btn btn-primary" data-nav="next">Дальше</button>')}
{step("Цвета и стиль",grp("p","colors","Любимые цвета",["Белый","Чёрный","Серый","Бежевый","Зелёный","Синий","Сливовый"])+grp("p","style","Стилевое направление",["Минимализм","Спорт-кэжуал","Классика","Уличный стиль"],0,"radio")+grp("p","comfort","Что важнее",["Комфорт","Баланс","Выразительность"],0,"radio"),NB+'<button type="button" class="btn btn-primary" data-nav="next">Дальше</button><button type="button" class="btn btn-link" data-nav="next">Пропустить</button>')}
{step("Посадка",grp("p","fit","Какая посадка вам удобна?",["Свободная","Стандартная","Более прилегающая","Не указывать"],0,"radio"),NB+'<button type="button" class="btn btn-primary" data-nav="next">Показать резюме</button><button type="button" class="btn btn-link" data-nav="next">Пропустить</button>')}
{step("Ваши предпочтения",'<dl id="p-summary" class="mb-2"></dl><p class="small">Предпочтения сохранены только в вашем браузере. Их можно изменить в любой момент.</p>','<a class="btn btn-primary" href="wardrobe.html">Перейти в гардероб</a><button type="button" class="btn btn-outline-primary" data-nav="edit">Изменить</button>')}
</div></div></section>''')

page("wardrobe","Мой гардероб",f'''<section class="section"><div class="container"><h1>Мой гардероб</h1><p class="mt-3">Демонстрационные вещи. Найдите нужную, добавьте свою или удалите лишнее. Список обнуляется при обновлении страницы.</p>{NOJS}
<div class="row g-2 mb-2"><div class="col-md-5"><label class="form-label" for="wq">Поиск по названию</label><input id="wq" type="search" class="form-control" placeholder="Например, джинсы"></div>
<div class="col-6 col-md-3"><label class="form-label" for="wcat">Категория</label><select id="wcat" class="form-select"><option value="">Все</option><option value="top">Верх</option><option value="bottom">Низ</option><option value="shoes">Обувь</option><option value="layer">Верхний слой</option></select></div>
<div class="col-6 col-md-4"><label class="form-label" for="wseason">Сезон</label><select id="wseason" class="form-select"><option value="">Все</option><option>весна</option><option>лето</option><option>осень</option><option>зима</option></select></div></div>
<p id="wcount" class="small" aria-live="polite"></p><div id="wgrid" class="row g-3"></div><p id="wempty" class="card-y mt-3" role="status" hidden></p>
<div class="card-y mt-5" style="max-width:640px"><h2 class="h4 mb-3">Добавить вещь</h2><p class="small">Фото необязательно: оно показывается только в этом браузере и никуда не отправляется.</p>
{form("add-form","вещь добавлена в гардероб.",fld("add","name","Название","text","required","","input",(),'autocomplete="off"')+fld("add","cat","Категория","","required","","select",("top","bottom","shoes","layer")).replace('<option>top</option>','<option value="top">Верх</option>').replace('<option>bottom</option>','<option value="bottom">Низ</option>').replace('<option>shoes</option>','<option value="shoes">Обувь</option>').replace('<option>layer</option>','<option value="layer">Верхний слой</option>')+fld("add","season","Сезон","","","","select",("весна","лето","осень","зима","всесезон"))+'<div class="mb-3"><label class="form-label" for="add-color">Цвет</label><input type="color" class="form-control form-control-color" id="add-color" name="color" value="#1F5C4C"></div>'+fld("add","photo","Фото (необязательно)","file","","JPG или PNG до 5 МБ.","input",(),'accept="image/*"'),"Добавить")}</div></div></section>''')

page("outfit-studio","Студия образов",f'''<section class="section"><div class="container"><h1>Студия образов</h1><p class="mt-3">Выберите вещи для каждого слота. Превью и подпись обновятся сразу.</p>{NOJS}
<div class="alert alert-secondary" role="note">Это концептуальный preview на условном манекене, а не точная 3D-примерка и не прогноз посадки.</div>
<div id="studio" class="row g-4"><div class="col-lg-5"><div class="stage" id="stage"></div><p id="cap" class="mt-3 fw-semibold" aria-live="polite"></p>
<div class="d-flex flex-wrap gap-2"><button id="save" type="button" class="btn btn-primary">Сохранить в избранное</button></div><p id="save-status" class="small mt-2" role="status" aria-live="polite"></p></div>
<div class="col-lg-7"><div class="mb-3"><p class="fw-semibold mb-2">Готовые капсулы</p><div class="d-flex flex-wrap gap-2"><button type="button" class="btn btn-outline-primary btn-sm" data-preset="Учёба">Учёба</button><button type="button" class="btn btn-outline-primary btn-sm" data-preset="Прогулка">Прогулка</button><button type="button" class="btn btn-outline-primary btn-sm" data-preset="Вечер">Вечер</button></div></div>
{''.join(f'<fieldset class="mb-3"><legend class="fs-6 fw-semibold">{t}</legend><div class="d-flex flex-wrap gap-2" id="slot-{k}"></div></fieldset>' for k,t in [("top","Верх"),("bottom","Низ"),("shoes","Обувь"),("layer","Дополнительный слой")])}
<h2 class="h5 mt-4">Избранное</h2><ul id="favs" class="list-unstyled"></ul></div></div></div></section>''')

page("shops","Магазины",f'''<section class="section"><div class="container"><h1>Каталог магазинов</h1><p class="mt-3">Так могли бы выглядеть товары локальных бутиков в одном месте.</p>
<div class="alert alert-secondary" id="demo-note" role="note">Демо-каталог: магазины, товары и цены вымышлены. Кнопки «Перейти в магазин» ведут на заглушку, реальных партнёров пока нет.</div>{NOJS}
<div class="row g-2 mb-2"><div class="col-md-8"><label class="form-label" for="sq">Поиск</label><input id="sq" type="search" class="form-control" placeholder="Товар или магазин"></div>
<div class="col-md-4"><label class="form-label" for="scat">Тип товара</label><select id="scat" class="form-select"><option value="">Все</option><option value="top">Верх</option><option value="bottom">Низ</option><option value="shoes">Обувь</option><option value="layer">Верхний слой</option></select></div></div>
<p id="scount" class="small" aria-live="polite"></p><div id="sgrid" class="row g-3"></div><p id="sempty" class="card-y mt-3" role="status" hidden>Ничего не найдено. Измените запрос или тип товара.</p>
<p class="mt-4">Вы владелец магазина? <a href="contact.html#partner">Оставьте заявку на подключение</a>.</p></div></section>''')

faqs=[("Это уже работающий AI-стилист?","Нет. Сейчас это демонстрационный MVP на HTML, CSS и JavaScript. Образы вы собираете сами, рекомендации на базе AI планируются в будущих версиях."),
("Будет ли точная виртуальная примерка?","Манекен показывает только цвета и сочетание вещей. Точную посадку и размер он не определяет, и мы не обещаем этого в демо."),
("Какие данные вы собираете?","Никаких на сервере. Анкета и избранное хранятся только в вашем браузере (localStorage), фото для предпросмотра не отправляются и не сохраняются. Пароли, платёжные данные и мерки не запрашиваются.",'privacy'),
("Оцениваете ли вы внешность или фигуру?","Нет. Персонализация основана на ваших добровольных предпочтениях и комфорте, а не на оценке тела."),
("Магазины и цены настоящие?","Нет, это примеры. Реальные партнёры будут подключаться только с их разрешения."),
("Что будет с формами заявок?","Они проверяют данные в браузере и показывают подтверждение, но на сервер ничего не отправляют.")]
acc=''.join(f'<div class="accordion-item"{f" id=\"{x[2]}\"" if len(x)>2 else ""}><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a{i}" aria-expanded="false" aria-controls="a{i}">{x[0]}</button></h2><div id="a{i}" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">{x[1]}</div></div></div>' for i,x in enumerate(faqs))
page("faq","FAQ",f'<section class="section"><div class="container" style="max-width:800px"><h1>Частые вопросы</h1><p class="mt-3">Ответы про приватность, точность и границы демо-версии.</p><div class="accordion mt-4" id="faq">{acc}</div></div></section>')

page("join","Регистрация на пилот",f'''<section class="section"><div class="container" style="max-width:680px"><h1>Заявка на участие в пилоте</h1><p class="mt-3">Это заявка на тестирование, а не создание аккаунта: пароль и платёжные данные не нужны.</p>
<div class="alert alert-secondary" role="note">Отправка на сервер не настроена: форма демонстрирует проверку и подтверждение.</div>
{form("join-form","заявка принята. Это демонстрационная заявка: отправка на сервер не настроена.",fld("join","name","Имя","text","required","","input",(),'autocomplete="name"')+fld("join","email","Email","email","required email","","input",(),'autocomplete="email"')+fld("join","city","Город","text","","Например, Бишкек.","input",(),'list="cities" autocomplete="off"')+'<datalist id="cities"><option>Бишкек</option><option>Ош</option><option>Каракол</option></datalist>'+grp("join","features","Какие функции вам интересны?",["Гардероб","Капсулы","Аватар","Локальные магазины"],1,msg="выберите хотя бы одну функцию.")+fld("join","goal","Цель участия","","","","select",("Попробовать сервис","Помочь с тестированием","Подключить магазин","Другое"))+consent("join"),"Отправить заявку")}</div></section>''')

page("contact","Контакты и партнёрам",f'''<section class="section"><div class="container"><h1>Контакты и партнёрам</h1><p class="mt-3">Пишите нам по любым вопросам. Магазинам: ниже отдельная форма.</p>
<div class="row g-4"><div class="col-lg-6"><div class="card-y"><h2 class="h4 mb-3">Написать сообщение</h2>
{form("contact-form","сообщение принято. Это демо: оно не отправлено на сервер.",fld("c","name","Имя","text","required")+fld("c","email","Email","email","required email")+fld("c","subject","Тема","text","required")+fld("c","message","Сообщение","","required","","textarea"),"Отправить сообщение")}</div></div>
<div class="col-lg-6" id="partner"><div class="card-y"><h2 class="h4 mb-3">Для магазинов</h2><p>Покажите ассортимент в цифровом каталоге рядом с готовыми образами. Подключение не гарантирует продаж, мы только проверяем интерес.</p>
{form("partner-form","заявка магазина принята. Это демо: данные не отправлены на сервер.",fld("p","shop","Название магазина","text","required")+fld("p","person","Контактное лицо","text","required")+fld("p","contact","Email или телефон","text","required")+fld("p","link","Ссылка на Instagram или каталог","url","url","Необязательно, но если указываете, то полной ссылкой.")+fld("p","msg","Комментарий","","","","textarea"),"Отправить заявку магазина")}</div></div></div></div></section>''')

open('README.md','w',encoding='utf-8').write('''# Your Wardrobe — AI Stylist

Демонстрационный многостраничный сайт-MVP (HTML5, CSS3, Bootstrap 5, vanilla JS) по SRS v1.0. Без сервера, без AI, без 3D-сканирования.

**Live URL:** https://<ваш-логин>.github.io/your-wardrobe/ (вставьте после публикации)

## Карта страниц
index, how-it-works, style-profile, wardrobe, outfit-studio, shops, join, contact (форма магазина `#partner`), faq (`#privacy`).

## Функции
- Единая фиксированная навигация с `aria-current`, мобильное меню Bootstrap, skip-ссылка.
- Анкета профиля из 3 шагов с прогрессом и резюме (localStorage).
- Гардероб: поиск, фильтры, добавление (с превью фото локально) и удаление вещей.
- Студия образов: слоты, готовые капсулы, избранное (localStorage).
- Демо-каталог магазинов с поиском и фильтром.
- Формы заявки на пилот, контактов и магазина: inline-ошибки, `aria-describedby`, `aria-live`, honeypot и проверка времени заполнения.

## Ограничения
Все товары, магазины и цены вымышлены. Превью на манекене не показывает посадку или размер. Формы ничего не отправляют. Манекен и иконки отрисовываются через JS; без JS видны тексты, навигация и пояснения.

## Кредиты
Bootstrap 5.3.3 (MIT, CDN jsDelivr). Шрифты Golos Text и Unbounded (SIL OFL, Google Fonts). Иллюстрации (манекен, иконки одежды) нарисованы для проекта как SVG, сторонних изображений нет.

## Публикация на GitHub Pages
1. Создайте публичный репозиторий `your-wardrobe` и загрузите файлы (без `build.py`, если не нужен).
2. Settings → Pages → Source: *Deploy from a branch*, ветка `main`, папка `/ (root)`.
3. Через минуту сайт откроется по адресу из Live URL.

## Quality Evidence (AC-12)
Сделайте 6–10 скриншотов по плану SRS (п. 13.1) и положите в `assets/images/screenshots/`.
''')
