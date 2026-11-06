(() => {
  'use strict';

  const API_URL = String(window.STYLO_STYLIST_API_URL || '').trim().replace(/\/+$/, '');
  const STORAGE_KEY = 'stylo_stylist_messages';
  const MAX_HISTORY = 12;
  const MAX_MESSAGE_LENGTH = 1200;
  const initialMessage = {
    role: 'assistant',
    text: 'Привет! Я AI-стилист Stylo. Помогу подобрать образ для случая, сочетать цвета и найти вещи в каталоге.'
  };
  const looks = [
    { name: 'Городской гранж', description: 'Бордовый · деним · детали' },
    { name: 'Тихая классика', description: 'Монохром · мягкий слой' },
    { name: 'После полуночи', description: 'Чёрный · фактуры · кожа' },
    { name: 'Уличный комфорт', description: 'Спорт · карго · кеды' },
    { name: 'Бордовая классика', description: 'Пальто · льняная рубашка · галстук · серые брюки' }
  ];
  const defaultWardrobe = [
    { name: 'Белая футболка', category: 'top', color: '#F2F2EE', season: 'лето' },
    { name: 'Зелёная рубашка', category: 'top', color: '#2F5D50', season: 'всесезон' },
    { name: 'Серый свитер', category: 'top', color: '#8A8F94', season: 'зима' },
    { name: 'Чёрная водолазка', category: 'top', color: '#25262B', season: 'осень' },
    { name: 'Синие джинсы', category: 'bottom', color: '#3B5B8C', season: 'всесезон' },
    { name: 'Бежевые брюки', category: 'bottom', color: '#C9B79C', season: 'лето' },
    { name: 'Чёрные брюки', category: 'bottom', color: '#2A2A2E', season: 'всесезон' },
    { name: 'Сливовая юбка миди', category: 'bottom', color: '#7A4A63', season: 'весна' },
    { name: 'Белые кеды', category: 'shoes', color: '#EFEFEA', season: 'лето' },
    { name: 'Чёрные ботинки', category: 'shoes', color: '#1E1E1E', season: 'зима' },
    { name: 'Коричневые лоферы', category: 'shoes', color: '#7B5238', season: 'осень' },
    { name: 'Бежевый тренч', category: 'layer', color: '#B9A27D', season: 'весна' },
    { name: 'Чёрная куртка', category: 'layer', color: '#2B2B30', season: 'зима' },
    { name: 'Зелёный кардиган', category: 'layer', color: '#4F7A62', season: 'осень' }
  ];
  const products = [
    ['Бордовое пальто', 'Верхняя одежда', 12500, ['S', 'M', 'L', 'XL']],
    ['Льняная рубашка', 'Верх', 3900, ['S', 'M', 'L', 'XL']],
    ['Серые классические брюки', 'Брюки', 5600, ['XS', 'S', 'M', 'L', 'XL']],
    ['Коричневый галстук', 'Аксессуары', 1800, ['Универсальный']],
    ['Бордовая рубашка', 'Верх', 2900, ['S', 'M', 'L', 'XL']],
    ['Чёрная рубашка', 'Верх', 2600, ['S', 'M', 'L', 'XL']],
    ['Чёрный свитер', 'Верх', 3400, ['XS', 'S', 'M', 'L']],
    ['Городская куртка', 'Верхняя одежда', 5200, ['S', 'M', 'L', 'XL']],
    ['Клетчатый жакет', 'Верхняя одежда', 6100, ['S', 'M', 'L']],
    ['Брюки-карго', 'Брюки', 4400, ['S', 'M', 'L', 'XL']],
    ['Брюки в тонкую полоску', 'Брюки', 3900, ['XS', 'S', 'M', 'L']],
    ['Высокие кеды', 'Обувь', 3800, ['37', '38', '39', '40', '41', '42', '43']],
    ['Чёрные ботинки', 'Обувь', 6900, ['37', '38', '39', '40', '41', '42']]
  ].map(([name, category, price, sizes]) => ({ name, category, price, sizes }));

  const messagesElement = document.querySelector('#stylist-messages');
  const form = document.querySelector('#stylist-form');
  const input = document.querySelector('#stylist-input');
  const sendButton = document.querySelector('#stylist-send');
  const consent = document.querySelector('#stylist-consent');
  const status = document.querySelector('#stylist-status');
  const suggestions = document.querySelector('#stylist-suggestions');
  let messages = [initialMessage];

  const readStoredMessages = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.every(item =>
        item && ['user', 'assistant'].includes(item.role) &&
        typeof item.text === 'string' && item.text.length <= MAX_MESSAGE_LENGTH)) {
        messages = [initialMessage, ...saved.slice(-(MAX_HISTORY - 1))];
      }
    } catch (error) {
      console.error('Could not restore stylist chat.', error);
      status.textContent = 'Не удалось восстановить историю чата.';
    }
  };

  const saveMessages = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(1).slice(-MAX_HISTORY + 1)));
    } catch (error) {
      console.error('Could not save stylist chat.', error);
      status.textContent = 'Историю чата не удалось сохранить в этой вкладке.';
    }
  };

  const renderMessages = () => {
    messagesElement.replaceChildren();
    for (const message of messages) {
      const bubble = document.createElement('p');
      bubble.className = `stylist-message is-${message.role}`;
      bubble.textContent = message.text;
      messagesElement.append(bubble);
    }
    messagesElement.scrollTop = messagesElement.scrollHeight;
  };

  const readObject = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (error) {
      console.error(`Could not read ${key} for stylist context.`, error);
      status.textContent = 'Не удалось прочитать данные профиля или гардероба.';
      return {};
    }
  };

  const buildContext = () => ({
    profile: readObject('yw_demo_profile'),
    wardrobe: (() => {
      try {
        const saved = localStorage.getItem('yw_wardrobe_items');
        if (saved === null) return defaultWardrobe;
        const stored = JSON.parse(saved);
        if (!Array.isArray(stored)) throw new Error('Saved wardrobe must be an array.');
        return stored.slice(0, 20).map(item => ({
          name: item.name,
          category: item.cat,
          color: item.color,
          season: item.season
        }));
      } catch (error) {
        console.error('Could not read saved wardrobe for stylist context.', error);
        status.textContent = 'Не удалось прочитать сохранённый гардероб.';
        return [];
      }
    })(),
    products: products.map(product => ({
      name: product.name,
      category: product.category,
      price: product.price,
      sizes: product.sizes
    })),
    looks
  });

  const updateControls = () => {
    sendButton.disabled = form.hasAttribute('aria-busy') || !consent.checked || !input.value.trim() || input.value.length > MAX_MESSAGE_LENGTH;
  };

  const sendMessage = async text => {
    if (form.hasAttribute('aria-busy')) return;
    if (!consent.checked) {
      status.textContent = 'Чтобы продолжить, подтверди передачу сообщения и данных профиля AI-сервису.';
      return;
    }
    if (!API_URL) {
      status.textContent = 'AI-сервис пока не подключён. Сначала разверни backend и укажи его адрес в stylist-config.js.';
      return;
    }
    if (!text || text.length > MAX_MESSAGE_LENGTH) {
      status.textContent = 'Сообщение должно содержать от 1 до 1200 символов.';
      return;
    }

    status.textContent = '';
    suggestions.hidden = true;
    messages.push({ role: 'user', text });
    messages = [initialMessage, ...messages.slice(1).slice(-MAX_HISTORY + 1)];
    renderMessages();
    saveMessages();
    input.value = '';
    updateControls();
    sendButton.disabled = true;
    form.setAttribute('aria-busy', 'true');

    const pending = document.createElement('p');
    pending.className = 'stylist-message is-pending';
    pending.textContent = 'Подбираю совет…';
    messagesElement.append(pending);
    messagesElement.scrollTop = messagesElement.scrollHeight;

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(1).map(({ role, text: messageText }) => ({ role, text: messageText })),
          context: buildContext()
        })
      });
      let result;
      try {
        result = await response.json();
      } catch (error) {
        throw new Error('Сервис вернул некорректный ответ.');
      }
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Сервис вернул некорректный ответ.');
      if (!response.ok) throw new Error(result.error || `Ошибка сервиса (${response.status}).`);
      if (typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('Стилист прислал пустой ответ.');
      messages.push({ role: 'assistant', text: result.reply.trim() });
      messages = [initialMessage, ...messages.slice(1).slice(-MAX_HISTORY + 1)];
      status.textContent = '';
      saveMessages();
    } catch (error) {
      console.error('Stylist request failed.', error);
      status.textContent = error instanceof Error ? error.message : 'Не удалось получить совет. Попробуй ещё раз.';
    } finally {
      form.removeAttribute('aria-busy');
      renderMessages();
      updateControls();
    }
  };

  consent.addEventListener('change', updateControls);
  input.addEventListener('input', updateControls);
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    form.requestSubmit();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    void sendMessage(input.value.trim());
  });
  suggestions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    input.value = button.textContent.trim();
    updateControls();
    void sendMessage(input.value);
  });
  document.querySelector('#stylist-clear').addEventListener('click', () => {
    messages = [initialMessage];
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      status.textContent = '';
    } catch (error) {
      console.error('Could not clear stylist chat.', error);
      status.textContent = 'Не удалось очистить историю в этой вкладке.';
    }
    suggestions.hidden = false;
    renderMessages();
  });

  readStoredMessages();
  renderMessages();
  updateControls();
  if (!API_URL) status.textContent = 'AI-сервис пока не подключён. После развёртывания backend укажи его адрес в stylist-config.js.';
})();
