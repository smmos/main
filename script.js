/* ==========================================================================
   МИНИМАЛЬНЫЙ JAVASCRIPT ЛЕНДИНГА
   --------------------------------------------------------------------------
   Три вещи:
   1. Тонкая линия у шапки при прокрутке.
   2. Выбор цвета обложки (большие обложки + квадраты в блоке цены).
   3. Напоминание, если кнопка оплаты ещё ведёт на заглушку "#".
   ========================================================================== */

// 1. Шапка: класс .is-scrolled добавляется при прокрутке,
//    CSS по нему рисует тонкую линию под шапкой.
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

// 2. Выбор цвета обложки.
//    Кликабельны и большие обложки (.cover-item), и квадраты в блоке цены
//    (.swatch) — у всех есть атрибут data-color с названием краски.
//    Выбранное название подставляется в строку «Обложка: …» рядом с ценой.
const colorButtons = document.querySelectorAll('[data-color]');
const selectedColorLabel = document.getElementById('selected-color');

function selectColor(colorName) {
  // Подсвечиваем выбранный вариант везде, снимаем выделение с остальных
  colorButtons.forEach((btn) => {
    btn.classList.toggle('is-selected', btn.dataset.color === colorName);
  });
  // Пишем название выбранной краски в блоке цены
  selectedColorLabel.textContent = colorName;
}

colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectColor(btn.dataset.color);
    // Клик по большой обложке дополнительно ведёт к блоку покупки
    if (btn.classList.contains('cover-item')) {
      document.getElementById('price').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 3. Кнопка оплаты: пока href="#" (заглушка), не даём странице прыгать
//    наверх и напоминаем, что ссылку на оплату нужно заменить.
//    Когда вставите настоящую платёжную ссылку — этот код сам перестанет
//    срабатывать, удалять его не обязательно.
document.querySelectorAll('a.btn-buy').forEach((button) => {
  button.addEventListener('click', (event) => {
    const href = button.getAttribute('href');
    if (href === '#' || href === '') {
      event.preventDefault();
      console.warn(
        'Кнопка оплаты пока ведёт на заглушку. ' +
        'Замените href у кнопки .btn-buy в index.html на вашу платёжную ссылку.'
      );
      alert('Здесь будет оплата 🙂 Ссылка подключается в index.html (кнопка .btn-buy).');
    }
  });
});
