/* ==========================================================================
   VIZHU · «РЕШЕНИЕ» — скрипт сайта
   --------------------------------------------------------------------------
   Здесь три вещи:
   1. НАСТРОЙКА ФОРМЫ — одна строка, которую нужно заполнить (см. ниже).
   2. Кнопки «Предзаказ» прокручивают к форме и ставят курсор в поле почты.
   3. Отправка формы с проверкой адреса и понятными сообщениями.
   ========================================================================== */


/* ==========================================================================
   ШАГ, КОТОРЫЙ НУЖНО СДЕЛАТЬ ПЕРЕД ПУБЛИКАЦИЕЙ
   --------------------------------------------------------------------------
   Сайт состоит только из файлов и сам по себе НЕ УМЕЕТ хранить почту.
   Чтобы адреса куда-то приходили, нужен бесплатный сервис форм.
   Заведите форму, скопируйте её адрес и вставьте его в кавычки ниже.

   Пример: const FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';

   Пока строка пустая, форма честно говорит посетителю, что приём заявок
   ещё не открыт, и НЕ делает вид, что письмо отправлено.
   ========================================================================== */

const FORM_ENDPOINT = '';


/* --------------------------------------------------------------------------
   1. Шапка: тонкая линия появляется при прокрутке
   -------------------------------------------------------------------------- */

const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});


/* --------------------------------------------------------------------------
   2. Кнопки «Предзаказ» — прокрутка к форме и курсор в поле почты
   -------------------------------------------------------------------------- */

const emailInput = document.getElementById('email');
const preorderSection = document.getElementById('preorder');

document.querySelectorAll('[data-scroll-to-email]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    preorderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Ставим курсор в поле после того, как прокрутка закончится
    window.setTimeout(() => emailInput.focus({ preventScroll: true }), 600);
  });
});


/* --------------------------------------------------------------------------
   3. Отправка формы
   -------------------------------------------------------------------------- */

const form = document.getElementById('preorder-form');
const status = document.getElementById('form-status');
const submitButton = form.querySelector('button[type="submit"]');

// Показать сообщение под формой
function showStatus(text, kind) {
  status.textContent = text;
  status.classList.remove('is-error', 'is-success');
  if (kind) status.classList.add('is-' + kind);
}

// Простая проверка: что-то@что-то.что-то
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();

  // Проверяем адрес до отправки
  if (!isValidEmail(email)) {
    emailInput.classList.add('has-error');
    showStatus('Проверьте адрес — кажется, в нём опечатка.', 'error');
    emailInput.focus();
    return;
  }
  emailInput.classList.remove('has-error');

  // Форма ещё не подключена к сервису — честно говорим об этом,
  // вместо того чтобы молча потерять адрес.
  if (!FORM_ENDPOINT) {
    showStatus('Приём предзаказов откроется совсем скоро. Напишите нам на почту из футера — добавим вас в список.', 'error');
    console.warn(
      'Форма не подключена: заполните FORM_ENDPOINT в начале файла script.js, ' +
      'иначе адреса посетителей никуда не сохраняются.'
    );
    return;
  }

  // Отправляем
  submitButton.disabled = true;
  showStatus('Отправляем…');

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);

    form.reset();
    showStatus('Готово. Пришлём письмо, когда откроем продажи.', 'success');
  } catch (error) {
    showStatus('Не получилось отправить. Проверьте соединение и попробуйте ещё раз.', 'error');
    console.error('Ошибка отправки формы:', error);
  } finally {
    submitButton.disabled = false;
  }
});

// Убираем подсветку ошибки, как только человек начал править адрес
emailInput.addEventListener('input', () => {
  emailInput.classList.remove('has-error');
});
