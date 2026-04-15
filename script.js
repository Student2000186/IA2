// =========================
// LOCAL STORAGE KEYS
// =========================
const USERS_KEY = "eazieatsUsers";
const CART_KEY = "eazieatsCart";
const ORDER_KEY = "eazieatsCurrentOrder";

// =========================
// HELPER FUNCTIONS
// =========================
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getOrder() {
  return JSON.parse(localStorage.getItem(ORDER_KEY)) || null;
}

function saveOrder(order) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
}

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function calculateCartTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.10;
  const taxedAmount = subtotal - discount;
  const tax = taxedAmount * 0.15;
  const total = taxedAmount + tax;

  return { subtotal, discount, tax, total };
}

// =========================
// ADD TO CART
// =========================
document.querySelectorAll(".add-cart").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: id,
        name: name,
        price: price,
        quantity: 1
      });
    }

    saveCart(cart);
    alert(name + " added to cart.");
  });
});

// =========================
// REGISTRATION (UPDATED)
// =========================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender")?.value || "Other";
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const registerMessage = document.getElementById("registerMessage");

    if (password !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      registerMessage.style.color = "red";
      return;
    }
      const users = getUsers();

    const existingUser = users.find(user =>
      user.username === username || user.email === email
    );

    if (existingUser) {
      registerMessage.textContent = "Username or email already exists.";
      registerMessage.style.color = "red";
      return;
    }

    const user = {
      fullName,
      dob,
      gender,
      email,
      phone,
      username,
      password
    };

    users.push(user);
    saveUsers(users);
    
    registerMessage.textContent = "Registration successful.";
    registerMessage.style.color = "green";
    registerForm.reset();
  });
}

// =========================
// LOGIN
// =========================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const loginUser = document.getElementById("loginUser").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    const users = getUsers();

    const foundUser = users.find(user =>
      (user.username === loginUser || user.email === loginUser) &&
      user.password === loginPassword
    );

    if (foundUser) {
      loginMessage.textContent = "Login successful.";
      loginMessage.style.color = "green";
    } else {
      loginMessage.textContent = "Invalid username/email or password.";
      loginMessage.style.color = "red";
    }
  });
}

// =========================
// RENDER CART
// =========================
function renderCart() {
  const cartTableBody = document.getElementById("cartTableBody");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartDiscount = document.getElementById("cartDiscount");
  const cartTax = document.getElementById("cartTax");
  const cartTotal = document.getElementById("cartTotal");
  const clearCartBtn = document.getElementById("clearCartBtn");

  if (!cartTableBody) return;

  const cart = getCart();
  cartTableBody.innerHTML = "";

  if (cart.length === 0) {
    cartTableBody.innerHTML = `
      <tr>
        <td colspan="5">Your cart is empty.</td>
      </tr>
    `;
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.name}</td>
        <td>${formatMoney(item.price)}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input">
        </td>
        <td>${formatMoney(item.price * item.quantity)}</td>
        <td>
          <button class="btn btn-danger remove-item" data-index="${index}">Remove</button>
        </td>
      `;

      cartTableBody.appendChild(row);
    });
  }

  const totals = calculateCartTotals(cart);
 cartSubtotal.textContent = "JMD " + formatMoney(totals.subtotal);
cartDiscount.textContent = "JMD " + formatMoney(totals.discount);
cartTax.textContent = "JMD " + formatMoney(totals.tax);
cartTotal.textContent = "JMD " + formatMoney(totals.total);

  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", function () {
      const index = this.dataset.index;
      const newQuantity = Number(this.value);

      if (newQuantity < 1) return;

      const cart = getCart();
      cart[index].quantity = newQuantity;
      saveCart(cart);
      renderCart();
    });
  });

  document.querySelectorAll(".remove-item").forEach(button => {
    button.addEventListener("click", function () {
      const index = this.dataset.index;
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  });

  if (clearCartBtn) {
    clearCartBtn.onclick = function () {
      localStorage.removeItem(CART_KEY);
      renderCart();
    };
  }
}

renderCart();

// =========================
// CHECKOUT SUMMARY
// =========================
function renderCheckoutSummary() {
  const checkoutItems = document.getElementById("checkoutItems");
  const checkoutSubtotal = document.getElementById("checkoutSubtotal");
  const checkoutDiscount = document.getElementById("checkoutDiscount");
  const checkoutTax = document.getElementById("checkoutTax");
  const checkoutTotal = document.getElementById("checkoutTotal");

  if (!checkoutItems) return;

  const cart = getCart();

  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
    checkoutSubtotal.textContent = "0.00";
    checkoutDiscount.textContent = "0.00";
    checkoutTax.textContent = "0.00";
    checkoutTotal.textContent = "0.00";
    return;
  }

  let html = "<ul class='checkout-list'>";
  cart.forEach(item => {
    html += `<li>${item.name} x ${item.quantity} - JMD ${formatMoney(item.price * item.quantity)}</li>`;
  });
  html += "</ul>";
  checkoutItems.innerHTML = html;

  const totals = calculateCartTotals(cart);
 checkoutSubtotal.textContent = "JMD " + formatMoney(totals.subtotal);
 checkoutDiscount.textContent = "JMD " + formatMoney(totals.discount);
 checkoutTax.textContent = "JMD " + formatMoney(totals.tax);
 checkoutTotal.textContent = "JMD " + formatMoney(totals.total);
}

renderCheckoutSummary();

// =========================
// CHECKOUT BUTTONS AND FORM
// =========================
const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
  const checkoutMessage = document.getElementById("checkoutMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", function () {
      checkoutMessage.textContent = "Details confirmed. You may now check out.";
      checkoutMessage.style.color = "green";
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      checkoutForm.reset();
      checkoutMessage.textContent = "Checkout input cancelled.";
      checkoutMessage.style.color = "red";
    });
  }

  checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const cart = getCart();

    if (cart.length === 0) {
      checkoutMessage.textContent = "Your cart is empty.";
      checkoutMessage.style.color = "red";
      return;
    }

    const totals = calculateCartTotals(cart);

    const order = {
      invoiceNumber: "EZ-" + Date.now(),
      orderDate: new Date().toLocaleString(),
      customerName: document.getElementById("customerName").value.trim(),
      address: document.getElementById("address").value.trim(),
      phone: document.getElementById("checkoutPhone").value.trim(),
      email: document.getElementById("checkoutEmail").value.trim(),
      parish: document.getElementById("parish").value.trim(),
      amountPaid: Number(document.getElementById("amountPaid").value),
      paymentMethod: document.getElementById("paymentMethod").value,
      items: cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total
    };

    saveOrder(order);
    localStorage.removeItem(CART_KEY);
    window.location.href = "invoice.html";
  });
}

// =========================
// RENDER INVOICE
// =========================
function renderInvoice() {
  const order = getOrder();
  const invoiceItems = document.getElementById("invoiceItems");

  if (!invoiceItems || !order) return;

  document.getElementById("invoiceNumber").textContent = order.invoiceNumber;
  document.getElementById("invoiceDate").textContent = order.orderDate;
  document.getElementById("invoiceName").textContent = order.customerName;
  document.getElementById("invoiceAddress").textContent = order.address;
  const invoiceParish = document.getElementById("invoiceParish");
if (invoiceParish) {
  invoiceParish.textContent = order.parish;
}
  document.getElementById("invoiceEmail").textContent = order.email;
  document.getElementById("invoicePhone").textContent = order.phone;
  document.getElementById("invoiceParish").textContent = order.parish;
  document.getElementById("invoicePaymentMethod").textContent = order.paymentMethod;

  invoiceItems.innerHTML = "";

  order.items.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(item.price * item.quantity)}</td>
    `;
    invoiceItems.appendChild(row);
  });

 document.getElementById("invoiceSubtotal").textContent = "JMD " + formatMoney(order.subtotal);
document.getElementById("invoiceDiscount").textContent = "JMD " + formatMoney(order.discount);
document.getElementById("invoiceTax").textContent = "JMD " + formatMoney(order.tax);
document.getElementById("invoiceTotal").textContent = "JMD " + formatMoney(order.total);
document.getElementById("invoiceAmountPaid").textContent = "JMD " + formatMoney(order.amountPaid);

const balance = order.amountPaid - order.total;
document.getElementById("invoiceBalance").textContent = "JMD " + formatMoney(balance);


}
// =========================
// PRINT INVOICE
// =========================
const printInvoiceBtn = document.getElementById("printInvoiceBtn");

if (printInvoiceBtn) {
  printInvoiceBtn.addEventListener("click", function () {
    window.print();
  });
}

renderInvoice();
