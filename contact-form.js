
const form = document.getElementById('myForm');
const submitButton = document.getElementById('submit-button');
const errorMessage = document.getElementById('error-message');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('d-none');
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const cart = JSON.parse(localStorage.getItem('productsInCart') || '[]');
  const confirmedOrder = cart.map((product) => product.id);

  if (confirmedOrder.length === 0) {
    showError('Your cart is empty. Add a camera before placing an order.');
    return;
  }

  if (!form.checkValidity()) {
    showError('Please complete all fields with valid information.');
    form.classList.add('was-validated');
    return;
  }

  errorMessage.textContent = '';
  errorMessage.classList.add('d-none');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  fetch(`${API_BASE_URL}/cameras/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contact: {
        firstName: formData.get('first-name').trim(),
        lastName: formData.get('last-name').trim(),
        address: formData.get('address').trim(),
        city: formData.get('city').trim(),
        email: formData.get('email').trim(),
      },
      products: confirmedOrder,
    }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then((data) => {
      if (!data.ok) {
        const details = data.data.details || [];
        throw new Error(details[0]?.message || data.data.error || 'Unable to place your order.');
      }

      const total = cart.reduce((sum, product) => sum + Number(product.price), 0);
      localStorage.removeItem("productsInCart");
      window.location.href = 'displayconfirmationpage.html?id=' + data.data.orderId + '&price=' + total;
    })
    .catch(function (error) {
      showError(error.message);
      submitButton.disabled = false;
      submitButton.textContent = 'Submit order';
    });
});