/* ==========================================================================
   ЛОГИКА ПРИЛОЖЕНИЯ «РЕШЕНИЕ · ПРОТОКОЛ»
   --------------------------------------------------------------------------
   Всё хранится ТОЛЬКО в браузере пользователя (localStorage) —
   никаких серверов, аккаунтов и отправки данных.

   Что здесь есть:
   1. Генерация повторяющихся блоков (12 версий, 7 дней поля).
   2. Автосохранение каждого поля с атрибутом data-save.
   3. Экспорт всех ответов в текстовый файл + печать.
   4. Кнопка «очистить всё».
   ========================================================================== */

const STORAGE_KEY = 'reshenie-protocol-v1';

/* --------------------------------------------------------------------------
   1. ГЕНЕРАЦИЯ ПОВТОРЯЮЩИХСЯ БЛОКОВ
   (чтобы не держать в HTML 12 почти одинаковых строк и 7 карточек дней)
   -------------------------------------------------------------------------- */

// 3.0 · Двенадцать версий: строка = номер + поле + чекбокс «разверну дальше»
const twelve = document.getElementById('twelve');
for (let i = 1; i <= 12; i++) {
  const row = document.createElement('div');
  row.className = 'twelve-row';
  row.innerHTML = `
    <span class="num">${String(i).padStart(2, '0')}</span>
    <input type="text" data-save="q-3-0-${i}" aria-label="Версия ${i}">
    <input type="checkbox" data-save="q-3-0-${i}-pick" title="Разверну эту версию дальше">
  `;
  twelve.appendChild(row);
}

// Стадия 5 · Поле: семь карточек дней со шкалой энергии 1–5
const week = document.getElementById('week');
const dayNames = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5', 'День 6', 'День 7'];
dayNames.forEach((name, idx) => {
  const n = idx + 1;
  const card = document.createElement('div');
  card.className = 'day-card';
  let energyBoxes = '';
  for (let e = 1; e <= 5; e++) {
    energyBoxes += `<input type="radio" name="energy-${n}" value="${e}" data-save="q-5-d${n}-energy" title="Энергия: ${e} из 5">`;
  }
  card.innerHTML = `
    <div class="day-head">
      <span class="day-title">${name}</span>
      <span class="energy"><span class="energy-label">Энергия</span>${energyBoxes}</span>
    </div>
    <textarea rows="3" data-save="q-5-d${n}-note" placeholder="Три строки: что делала, где была энергия…"></textarea>
  `;
  week.appendChild(card);
});

/* --------------------------------------------------------------------------
   2. АВТОСОХРАНЕНИЕ
   Каждое поле с data-save читается и пишется в один объект в localStorage.
   -------------------------------------------------------------------------- */

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();
const fields = document.querySelectorAll('[data-save]');

// Восстанавливаем сохранённые значения
fields.forEach((el) => {
  const key = el.dataset.save;
  if (!(key in state)) return;
  if (el.type === 'checkbox') {
    el.checked = state[key] === true;
  } else if (el.type === 'radio') {
    if (el.value === state[key]) el.checked = true;
  } else {
    el.value = state[key];
  }
});

// Сохраняем при каждом изменении
fields.forEach((el) => {
  el.addEventListener('input', () => {
    const key = el.dataset.save;
    if (el.type === 'checkbox') {
      state[key] = el.checked;
    } else if (el.type === 'radio') {
      if (el.checked) state[key] = el.value;
    } else {
      state[key] = el.value;
    }
    saveState(state);
  });
});

/* --------------------------------------------------------------------------
   3. ЭКСПОРТ И ПЕЧАТЬ
   Собираем все подписи и ответы по порядку в читабельный текстовый файл.
   -------------------------------------------------------------------------- */

function buildExportText() {
  const lines = [];
  lines.push('РЕШЕНИЕ · ПРОТОКОЛ ОДНОГО РЕШЕНИЯ');
  lines.push('Студия инструментов мышления');
  lines.push('='.repeat(48));

  document.querySelectorAll('.app-intro, .app-stage').forEach((section) => {
    const stageTitle = section.querySelector('.stage-head-title');
    if (stageTitle) {
      lines.push('');
      lines.push('-'.repeat(48));
      lines.push('СТАДИЯ ' + stageTitle.textContent.trim());
      lines.push('-'.repeat(48));
    }
    section.querySelectorAll('[data-save]').forEach((el) => {
      // Название поля: ближайшая подпись field-label / field-sublabel
      const wrap = el.closest('.field, .frame, .twelve-row, .day-card');
      let label = '';
      if (wrap) {
        const lab = wrap.querySelector('.field-label, .field-sublabel, .frame-head span, .day-title, .num');
        if (lab) label = lab.textContent.trim();
      }
      if (el.type === 'checkbox') {
        if (el.checked) lines.push(`[×] ${label || el.dataset.save} — отмечено`);
      } else if (el.type === 'radio') {
        if (el.checked) lines.push(`${label}: энергия ${el.value}/5`);
      } else if (el.value.trim()) {
        lines.push(`${label ? label + ':' : ''}`);
        lines.push(el.value.trim());
        lines.push('');
      }
    });
  });

  lines.push('');
  lines.push('Экспортировано: ' + new Date().toLocaleDateString('ru-RU'));
  return lines.join('\n');
}

function exportProtocol() {
  const blob = new Blob([buildExportText()], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reshenie-protokol.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('export-btn').addEventListener('click', exportProtocol);
document.getElementById('export-btn-2').addEventListener('click', exportProtocol);
document.getElementById('print-btn').addEventListener('click', () => window.print());

/* --------------------------------------------------------------------------
   4. ОЧИСТКА
   -------------------------------------------------------------------------- */

document.getElementById('reset-btn').addEventListener('click', () => {
  const sure = confirm(
    'Удалить все ответы и начать протокол заново?\n' +
    'Это действие нельзя отменить. Сначала можно скачать протокол.'
  );
  if (!sure) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
});
