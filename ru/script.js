/* ==========================================================================
   vizhu.notes — скрипт сайта
   --------------------------------------------------------------------------
   Здесь четыре вещи:
   1. НАСТРОЙКА ФОРМЫ — одна строка, которую нужно заполнить (см. ниже).
   2. Слайдер первого экрана: сам листается, точки, остановка при наведении.
   3. Кнопки «Предзаказ» — прокрутка к форме с подстановкой блокнота.
   4. Отправка формы с проверкой адреса.
   ========================================================================== */


/* ==========================================================================
   ШАГ, КОТОРЫЙ НУЖНО СДЕЛАТЬ ПЕРЕД ПУБЛИКАЦИЕЙ
   --------------------------------------------------------------------------
   Сайт состоит только из файлов и сам по себе НЕ УМЕЕТ хранить почту.
   Чтобы адреса куда-то приходили, нужен бесплатный сервис форм
   (Formspree, Getform, Web3Forms, Яндекс Формы).
   Заведите форму, скопируйте её адрес и вставьте его в кавычки ниже.

   Пример: const FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';

   Пока строка пустая, форма честно говорит посетителю, что приём заявок
   ещё не открыт, и НЕ делает вид, что письмо отправлено.
   ========================================================================== */

const FORM_ENDPOINT = '';

/* Как часто сам листается слайдер, в миллисекундах (6000 = 6 секунд) */
const SLIDE_INTERVAL = 6000;


/* --------------------------------------------------------------------------
   1. Шапка: тонкая линия появляется при прокрутке
   -------------------------------------------------------------------------- */

const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});


/* --------------------------------------------------------------------------
   2. Слайдер первого экрана
   -------------------------------------------------------------------------- */

const slider = document.getElementById('slider');
const slides = Array.from(slider.querySelectorAll('.slide'));
const dots = Array.from(document.getElementById('dots').querySelectorAll('button'));

let current = 0;
let timer = null;

// Показать слайд с нужным номером
function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
  dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === current)));
}

function nextSlide() {
  showSlide(current + 1);
}

// Запустить и остановить автолистание
function startAuto() {
  stopAuto();
  // Если в системе включено «меньше движения» — не листаем сами
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  timer = window.setInterval(nextSlide, SLIDE_INTERVAL);
}

function stopAuto() {
  if (timer) window.clearInterval(timer);
  timer = null;
}

// Клик по точке переключает слайд и перезапускает отсчёт
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    showSlide(i);
    startAuto();
  });
});

// Пока курсор или фокус внутри слайдера — он не листается сам
slider.addEventListener('mouseenter', stopAuto);
slider.addEventListener('mouseleave', startAuto);
slider.addEventListener('focusin', stopAuto);
slider.addEventListener('focusout', startAuto);

// Во вкладке, которую не смотрят, листать незачем
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAuto();
  else startAuto();
});

startAuto();


/* --------------------------------------------------------------------------
   3. Кнопки «Предзаказ»
   Любая кнопка с атрибутом data-preorder прокручивает к форме.
   Если у неё есть data-notebook — этот блокнот отмечается в форме.
   -------------------------------------------------------------------------- */

const preorderSection = document.getElementById('preorder');
const emailInput = document.getElementById('email');
const form = document.getElementById('preorder-form');

document.querySelectorAll('[data-preorder]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();

    // Отмечаем нужный блокнот в форме
    const wanted = button.dataset.notebook;
    if (wanted) {
      const radio = form.querySelector(`input[name="notebook"][value="${wanted}"]`);
      if (radio) radio.checked = true;
    }

    preorderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Курсор в поле почты — после того, как прокрутка закончится
    window.setTimeout(() => emailInput.focus({ preventScroll: true }), 600);
  });
});


/* --------------------------------------------------------------------------
   4. Отправка формы
   -------------------------------------------------------------------------- */

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

  submitButton.disabled = true;
  showStatus('Отправляем…');

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),   // уходит и почта, и выбранный блокнот
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);

    form.reset();
    showStatus('Готово. Напишем, когда откроем продажи.', 'success');
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
