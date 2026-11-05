(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const LOOKS = {
    burgundy: { name: 'Городской гранж', description: 'Бордовый · деним · детали', image: 'burgundy-street.png', top: '#7d2838', layer: '#64212d', bottom: '#292832', shoes: '#17171b', accent: '#c6a9c5' },
    monochrome: { name: 'Тихая классика', description: 'Монохром · мягкий слой', image: 'monochrome-classic.png', top: '#17171b', layer: '#44464e', bottom: '#292a31', shoes: '#17171b', accent: '#b9b8c2' },
    noir: { name: 'После полуночи', description: 'Чёрный · фактуры · кожа', image: 'black-editorial.png', top: '#17171b', layer: '#222329', bottom: '#29292e', shoes: '#151519', accent: '#85808f' },
    sport: { name: 'Уличный комфорт', description: 'Спорт · карго · кеды', image: 'sport-urban.png', top: '#202126', layer: '#343a42', bottom: '#282a2f', shoes: '#eeeae3', accent: '#aeb6ba' }
  };

  const tabs = $$('.app-tab');
  if (tabs.length) {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    tabs.forEach(tab => {
      const active = tab.getAttribute('href') === currentPage;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
  }

  const grid = $('#look-grid');
  if (grid) {
    const cards = $$('.look-card', grid);
    const status = $('#favorite-status');
    const favoriteKey = 'yw_demo_favorites';
    let favorites = [];
    try {
      favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
      if (!Array.isArray(favorites)) favorites = [];
    } catch (error) {
      console.error('Could not read saved looks.', error);
    }

    const paintFavorite = (card, active) => {
      const button = $('.look-favorite', card);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? 'Убрать образ из избранного' : 'Добавить образ в избранное');
    };
    cards.forEach(card => paintFavorite(card, favorites.includes(card.dataset.look)));

    grid.addEventListener('click', event => {
      const button = event.target.closest('.look-favorite');
      if (!button) return;
      const card = button.closest('.look-card');
      const id = card.dataset.look;
      favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
      paintFavorite(card, favorites.includes(id));
      try {
        localStorage.setItem(favoriteKey, JSON.stringify(favorites));
        status.hidden = true;
        status.textContent = '';
      } catch (error) {
        status.hidden = false;
        status.textContent = 'Не удалось сохранить избранное на этом устройстве.';
        console.error('Could not save favorite looks.', error);
      }
    });

    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      $$('[data-filter]').forEach(chip => {
        const selected = chip === button;
        chip.classList.toggle('is-selected', selected);
        chip.setAttribute('aria-pressed', String(selected));
      });
      cards.forEach(card => {
        card.hidden = button.dataset.filter !== 'all' && card.dataset.style !== button.dataset.filter;
      });
    }));

    $('#shuffle-looks')?.addEventListener('click', () => {
      const shuffled = [...cards].sort(() => Math.random() - .5);
      shuffled.forEach(card => grid.append(card));
    });
  }

  const favoriteGrid = $('#favorites-grid');
  if (favoriteGrid) {
    const emptyState = $('#favorites-empty');
    const status = $('#favorite-status');
    const favoriteKey = 'yw_demo_favorites';
    const renderFavorites = () => {
      let favorites = [];
      try {
        favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        if (!Array.isArray(favorites)) favorites = [];
      } catch (error) {
        console.error('Could not read saved looks.', error);
      }
      const savedLooks = favorites.filter(id => LOOKS[id]);
      emptyState.hidden = savedLooks.length > 0;
      favoriteGrid.innerHTML = savedLooks.map((id, index) => {
        const look = LOOKS[id];
        return `<article class="look-card" data-saved-look="${id}">
          <div class="look-image-wrap">
            <img class="look-image" src="assets/images/looks/${look.image}" alt="${look.name}: ${look.description}">
            <button class="look-favorite" type="button" data-remove-favorite="${id}" aria-label="Убрать из избранного" aria-pressed="true">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>
            </button>
            <span class="look-number">${String(index + 1).padStart(2, '0')} / ${String(savedLooks.length).padStart(2, '0')}</span>
          </div>
          <div class="look-info">
            <div><h3>${look.name}</h3><p>${look.description}</p></div>
            <a class="try-on-button" href="index.html?tryon=${id}"><span aria-hidden="true">✦</span> Примерить</a>
          </div>
        </article>`;
      }).join('');
    };

    favoriteGrid.addEventListener('click', event => {
      const button = event.target.closest('[data-remove-favorite]');
      if (!button) return;
      try {
        const favorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        localStorage.setItem(favoriteKey, JSON.stringify(favorites.filter(id => id !== button.dataset.removeFavorite)));
        status.hidden = true;
        status.textContent = '';
        renderFavorites();
      } catch (error) {
        status.hidden = false;
        status.textContent = 'Не удалось изменить список избранного.';
        console.error('Could not update saved looks.', error);
      }
    });
    renderFavorites();
  }

  const modal = $('#tryon-dialog');
  if (modal) {
    const avatar = $('#tryon-avatar');
    const title = $('#tryon-look-name');
    const photoInput = $('#tryon-photo');
    const photoPreview = $('#tryon-photo-preview');
    const photoStatus = $('#tryon-photo-status');
    let selectedPhotoUrl = '';
    const showSessionPhoto = () => {
      try {
        const savedPhoto = sessionStorage.getItem('yw_demo_photo');
        if (savedPhoto) {
          photoPreview.src = savedPhoto;
          photoPreview.hidden = false;
          photoStatus.textContent = 'Твоё фото только для просмотра в этой вкладке. Это демо не отправляет и не переодевает его.';
        } else {
          photoStatus.textContent = 'Фото останется только в этой вкладке браузера и не отправится на сервер.';
        }
      } catch (error) {
        console.error('Could not load session photo for demo try-on.', error);
      }
    };

    const drawAvatar = look => {
      avatar.innerHTML = `<svg viewBox="0 0 240 360" role="img" aria-label="Иллюстрация человека в образе «${look.name}»">
        <ellipse cx="120" cy="343" rx="70" ry="9" fill="#d9d4e4"/>
        <path d="M92 57c0-22 12-36 28-36s28 14 28 36-12 36-28 36-28-14-28-36Z" fill="#e7c2a8"/>
        <path d="M91 59c-5-30 12-45 30-45 20 0 31 16 28 45-6-10-12-19-20-24-9 13-21 19-38 24Z" fill="#353039"/>
        <path d="M106 87h28v24h-28z" fill="#dfb69d"/>
        <path d="m105 101-26 7-25 55 18 10 18-31 6 72h48l5-72 18 31 18-10-25-55-26-7Z" fill="${look.top}" stroke="#292531" stroke-opacity=".18" stroke-width="2"/>
        <path d="m80 110-23 51 9 10 24-37M160 110l23 51-9 10-24-37" fill="none" stroke="#e7c2a8" stroke-linecap="round" stroke-width="13"/>
        <path d="m96 212 48 0 13 113-27 4-10-83-9 83-27-4Z" fill="${look.bottom}" stroke="#292531" stroke-opacity=".2" stroke-width="2"/>
        ${look.layer ? `<path d="m94 106-16 7-8 43 18 14 8-29 1 74h46l2-74 8 29 18-14-8-43-17-7-26 14Z" fill="${look.layer}" fill-opacity=".72" stroke="#292531" stroke-opacity=".22" stroke-width="2"/>` : ''}
        <path d="m93 318 24 2-1 23H83c-4-7 0-17 10-25ZM128 320l24-2 13 25c-5 5-24 5-39 0Z" fill="${look.shoes}"/>
        <path d="M110 128v50M108 178h25" stroke="${look.accent}" stroke-opacity=".72" stroke-width="2"/>
      </svg>`;
    };

    const openTryOn = id => {
      const look = LOOKS[id];
      if (!look) return;
      title.textContent = look.name;
      drawAvatar(look);
      showSessionPhoto();
      if (modal.open) modal.close();
      modal.showModal();
    };

    $$('[data-tryon]').forEach(button => button.addEventListener('click', () => openTryOn(button.dataset.tryon)));
    $$('[data-close-tryon]').forEach(button => button.addEventListener('click', () => modal.close()));
    modal.addEventListener('click', event => {
      if (event.target === modal) modal.close();
    });
    modal.addEventListener('close', () => {
      if (selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
      selectedPhotoUrl = '';
      photoInput.value = '';
      photoPreview.removeAttribute('src');
      photoPreview.hidden = true;
      photoStatus.textContent = 'Фото останется только в этой вкладке браузера и не отправится на сервер.';
    });

    if (photoInput) photoInput.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      const status = $('#tryon-photo-status');
      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        status.textContent = 'Выбери изображение размером до 5 МБ.';
        photoInput.value = '';
        return;
      }
      if (selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
      selectedPhotoUrl = URL.createObjectURL(file);
      photoPreview.src = selectedPhotoUrl;
      photoPreview.hidden = false;
      status.textContent = 'Фото показано только здесь. Эта демо-функция не отправляет его и не меняет одежду на снимке.';
    });

    const requestedLook = new URLSearchParams(location.search).get('tryon');
    if (requestedLook && LOOKS[requestedLook]) openTryOn(requestedLook);
  }

  const profileForm = $('#measurements-form');
  if (profileForm) {
    const fileInput = $('#profile-photo');
    const photoBox = $('#profile-photo-preview');
    const photoStatus = $('#photo-status');
    const status = $('#profile-status');
    const advancedToggle = $('#advanced-toggle');
    const advanced = $('#advanced-measurements');
    const profileKey = 'yw_demo_profile';

    advancedToggle?.addEventListener('click', () => {
      const expanded = advancedToggle.getAttribute('aria-expanded') === 'true';
      advancedToggle.setAttribute('aria-expanded', String(!expanded));
      advanced.hidden = expanded;
      $('span:last-child', advancedToggle).textContent = expanded ? '＋' : '−';
    });

    try {
      const saved = JSON.parse(localStorage.getItem(profileKey) || '{}');
      Object.entries(saved).forEach(([name, value]) => {
        if (profileForm.elements.namedItem(name)) profileForm.elements.namedItem(name).value = value;
      });
    } catch (error) {
      console.error('Could not load saved profile.', error);
    }

    const showPhoto = dataUrl => {
      const image = new Image();
      image.alt = '';
      image.onload = () => {
        photoBox.replaceChildren(image);
        $('#header-profile')?.replaceChildren(image.cloneNode());
      };
      image.onerror = () => {
        sessionStorage.removeItem('yw_demo_photo');
        photoStatus.textContent = 'Не удалось открыть сохранённое фото. Выбери другое.';
      };
      image.src = dataUrl;
    };
    try {
      const savedPhoto = sessionStorage.getItem('yw_demo_photo');
      if (savedPhoto) showPhoto(savedPhoto);
    } catch (error) {
      console.error('Could not load session photo.', error);
    }

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
        photoStatus.textContent = 'Выбери изображение размером до 10 МБ.';
        fileInput.value = '';
        return;
      }
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const image = new Image();
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Не удалось прочитать файл.'));
          reader.onload = () => {
            image.onerror = () => reject(new Error('Не удалось открыть изображение.'));
            image.onload = () => {
              const scale = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
              const canvas = document.createElement('canvas');
              canvas.width = Math.round(image.naturalWidth * scale);
              canvas.height = Math.round(image.naturalHeight * scale);
              canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', .78));
            };
            image.src = reader.result;
          };
          reader.readAsDataURL(file);
        });
        sessionStorage.setItem('yw_demo_photo', dataUrl);
        showPhoto(dataUrl);
        photoStatus.textContent = 'Фото доступно в этой вкладке браузера и не отправляется.';
      } catch (error) {
        photoStatus.textContent = 'Фото не удалось подготовить. Попробуй другое изображение.';
        console.error('Could not prepare profile photo.', error);
      }
    });

    profileForm.addEventListener('submit', event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(profileForm).entries());
      delete values.photo;
      try {
        localStorage.setItem(profileKey, JSON.stringify(values));
        status.textContent = 'Размеры сохранены на этом устройстве.';
      } catch (error) {
        status.textContent = 'Не удалось сохранить параметры в браузере.';
        console.error('Could not save profile.', error);
      }
    });
  }
})();
