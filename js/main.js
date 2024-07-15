let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(item) {
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${item} added to cart!`);
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById('cartItems');
  if (cartItems) {
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;

      // Add cancel button for each item
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.onclick = () => removeFromCart(index);
      li.appendChild(cancelButton);

      cartItems.appendChild(li);
    });

    // Add clear cart button
    const clearCartButton = document.createElement('button');
    clearCartButton.textContent = 'Clear Cart';
    clearCartButton.onclick = clearCart;
    cartItems.appendChild(clearCartButton);
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
}

function clearCart() {
  cart = [];
  localStorage.removeItem('cart');
  updateCart();
}

function confirmOrder() {
  window.location.href = '/order';
}

function showOrderForm() {
  document.getElementById('orderForm').style.display = 'block';
}

document.getElementById('orderForm')?.addEventListener('submit', function(e) {
  e.preventDefault();  // Prevent the default form submission

  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;

  fetch('/submit-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, address, phone, items: cart }),
  })
  .then(response => {
    if (response.ok) {
      localStorage.removeItem('cart');
      window.location.href = '/success';
    } else {
      alert('Order submission failed!');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

document.addEventListener('DOMContentLoaded', updateCart);
