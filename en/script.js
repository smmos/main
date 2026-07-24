/* ==========================================================================
   DECISION — English site script
   --------------------------------------------------------------------------
   Three small things:
   1. A hairline under the header once the page is scrolled.
   2. Cover colour selection (large covers + swatches in the buy block).
   3. A reminder while the payment button still points at a placeholder.
   ========================================================================== */

// 1. Header: the .is-scrolled class draws the hairline defined in styles.css
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
});

// 2. Cover colour selection.
//    Both the large covers (.cover-item) and the swatches (.swatch) carry a
//    data-color attribute; the chosen name is echoed next to the price.
const colorButtons = document.querySelectorAll('[data-color]');
const selectedColorLabel = document.getElementById('selected-color');

function selectColor(colorName) {
  colorButtons.forEach((btn) => {
    btn.classList.toggle('is-selected', btn.dataset.color === colorName);
  });
  selectedColorLabel.textContent = colorName;
}

colorButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectColor(btn.dataset.color);
    // Clicking a large cover also scrolls down to the buy block
    if (btn.classList.contains('cover-item')) {
      document.getElementById('buy').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 3. Payment button: while href is still "#", stop the page from jumping to
//    the top and say so out loud. Once you paste a real payment link this
//    code stops firing on its own — there is no need to delete it.
document.querySelectorAll('a.btn-buy').forEach((button) => {
  button.addEventListener('click', (event) => {
    const href = button.getAttribute('href');
    if (href === '#' || href === '') {
      event.preventDefault();
      console.warn(
        'The payment button is still a placeholder. Replace the href on ' +
        '.btn-buy in index.html with your payment link.'
      );
      alert('Payment coming soon. The link is set on the .btn-buy button in index.html.');
    }
  });
});
