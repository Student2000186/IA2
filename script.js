// =========================
// LOCAL STORAGE KEYS
// =========================
const USERS_KEY = "RegistrationData";
const CART_KEY = "eazieatsCart";
const ORDER_KEY = "eazieatsCurrentOrder";
const ALL_PRODUCTS_KEY = "AllProducts";
const ALL_INVOICES_KEY = "AllInvoices";
const CURRENT_USER_KEY = "CurrentUserTRN";
const LOGIN_ATTEMPTS_KEY = "LoginAttempts";

// =========================
// PRODUCT DATA
// =========================
const defaultProducts = [
  {
    id: "1",
    name: "Jerk Chicken Meal",
    price: 1800,
    description: "Spicy jerk chicken served with rice and vegetables.",
    image: "jerk_Chicken.jpg"
  },
  {
    id: "2",
    name: "Fried Chicken Combo",
    price: 1600,
    description: "Crispy fried chicken with fries and a drink.",
    image: "friedchicken.png"
  },
  {
    id: "3",
    name: "Veggie Wrap",
    price: 1200,
    description: "Fresh vegetables wrapped in a soft tortilla.",
    image: "vegan.png"
  },
  {
    id: "4",
    name: "Pasta Box",
    price: 1500,
    description: "Creamy pasta with seasoned chicken and herbs.",
    image: "Pasta.png"
  },
  {
    id: "5",
    name: "Fresh Juice",
    price: 600,
    description: "Chilled fruit juice made fresh daily.",
    image: "juice.png"
  },
  {
    id: "6",
    name: "Burger Combo",
    price: 1700,
    description: "Juicy burger served with fries and a soft drink.",
    image: "burger.png"
  }
];

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

function getAllInvoices() {
  return JSON.parse(localStorage.getItem(ALL_INVOICES_KEY)) || [];
}

function saveAllInvoices(invoices) {
  localStorage.setItem(ALL_INVOICES_KEY, JSON.stringify(invoices));
}

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function setCurrentUserTRN(trn) {
  localStorage.setItem(CURRENT_USER_KEY, trn);
}

function getCurrentUserTRN() {
  return localStorage.getItem(CURRENT_USER_KEY) || "";
}

function setLoginAttempts(count) {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, String(count));
}

function getLoginAttempts() {
  return Number(localStorage.getItem(LOGIN_ATTEMPTS_KEY)) || 0;
}

function resetLoginAttempts() {
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function validTRN(trn) {
  return /^\d{3}-\d{3}-\d{3}$/.test(trn);
}

function getAgeGroup(age) {
  if (age >= 18 && age <= 25) return "18-25";
  if (age >= 26 && age <= 35) return "26-35";
  if (age >= 36 && age <= 50) return "36-50";
  return "50+";
}

function calculateCartTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.10;
  const taxedAmount = subtotal - discount;
  const tax = taxedAmount * 0.15;
  const total = taxedAmount + tax;

  return { subtotal, discount, tax, total };
}

function initializeProducts() {
  if (!localStorage.getItem(ALL_PRODUCTS_KEY)) {
    localStorage.setItem(ALL_PRODUCTS_KEY, JSON.stringify(defaultProducts));
  }
}

initializeProducts();

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
        id,
        name,
        price,
        quantity: 1
      });
    }

    saveCart(cart);
    alert(name + " added to cart.");
  });
});

// =========================
// REGISTRATION
// =========================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const trn = document.getElementById("trn").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const registerMessage = document.getElementById("registerMessage");

    if (!validTRN(trn)) {
      registerMessage.textContent = "TRN must be in the format 000-000-000.";
      registerMessage.style.color = "red";
      return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
      registerMessage.textContent = "You must be over 18 years old to register.";
      registerMessage.style.color = "red";
      return;
    }

    if (password.length < 8) {
      registerMessage.textContent = "Password must be at least 8 characters long.";
      registerMessage.style.color = "red";
      return;
    }

    if (password !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      registerMessage.style.color = "red";
      return;
    }

    const users = getUsers();
    const existingUser = users.find(user => user.trn === trn);

    if (existingUser) {
      registerMessage.textContent = "TRN already exists. Please use a unique TRN.";
      registerMessage.style.color = "red";
      return;
    }

    const user = {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dob,
      gender,
      age,
      ageGroup: getAgeGroup(age),
      phone,
      email,
      trn,
      password,
      dateOfRegistration: new Date().toLocaleString(),
      cart: [],
      invoices: []
    };

    users.push(user);
    saveUsers(users);

    registerMessage.textContent = "Registration successful. You can now log in.";
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

    const loginTrn = document.getElementById("loginTrn").value.trim();
    const loginPassword = document.getElementById("loginPassword").value;
    const loginMessage = document.getElementById("loginMessage");

    let attempts = getLoginAttempts();

    if (attempts >= 3) {
      loginMessage.textContent = "Account locked. You used all 3 login attempts.";
      loginMessage.style.color = "red";
      return;
    }

    const users = getUsers();
    const foundUser = users.find(user => user.trn === loginTrn && user.password === loginPassword);

    if (foundUser) {
      setCurrentUserTRN(foundUser.trn);
      resetLoginAttempts();
      loginMessage.textContent = "Login successful. Redirecting to product catalogue...";
      loginMessage.style.color = "green";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      attempts += 1;
      setLoginAttempts(attempts);

      if (attempts >= 3) {
        loginMessage.textContent = "Account locked. You used all 3 login attempts.";
      } else {
        loginMessage.textContent = `Invalid TRN or password. Attempts remaining: ${3 - attempts}`;
      }

      loginMessage.style.color = "red";
    }
  });

  const resetPasswordLink = document.getElementById("resetPasswordLink");
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();

      const trn = prompt("Enter your TRN:");
      if (!trn) return;

      const newPassword = prompt("Enter your new password (minimum 8 characters):");
      if (!newPassword) return;

      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }

      const users = getUsers();
      const index = users.findIndex(user => user.trn === trn);

      if (index === -1) {
        alert("TRN not found.");
        return;
      }

      users[index].password = newPassword;
      saveUsers(users);
      resetLoginAttempts();
      alert("Password reset successful.");
    });
  }
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
        <td>JMD ${formatMoney(item.price)}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input">
        </td>
        <td>JMD ${formatMoney(item.price * item.quantity)}</td>
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
    checkoutSubtotal.textContent = "JMD 0.00";
    checkoutDiscount.textContent = "JMD 0.00";
    checkoutTax.textContent = "JMD 0.00";
    checkoutTotal.textContent = "JMD 0.00";
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
// CHECKOUT FORM
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
    const currentUserTRN = getCurrentUserTRN();

    if (!currentUserTRN) {
      checkoutMessage.textContent = "Please log in before checking out.";
      checkoutMessage.style.color = "red";
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(user => user.trn === currentUserTRN);

    if (userIndex === -1) {
      checkoutMessage.textContent = "Current user not found.";
      checkoutMessage.style.color = "red";
      return;
    }

    const amountPaid = Number(document.getElementById("amountPaid").value);

    const order = {
      invoiceNumber: "EZ-" + Date.now(),
      orderDate: new Date().toLocaleString(),
      trn: currentUserTRN,
      customerName: document.getElementById("customerName").value.trim(),
      address: document.getElementById("address").value.trim(),
      phone: document.getElementById("checkoutPhone").value.trim(),
      email: document.getElementById("checkoutEmail").value.trim(),
      parish: document.getElementById("parish").value.trim(),
      amountPaid: amountPaid,
      paymentMethod: document.getElementById("paymentMethod").value,
      items: cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      balance: amountPaid - totals.total
    };

    saveOrder(order);

    const allInvoices = getAllInvoices();
    allInvoices.push(order);
    saveAllInvoices(allInvoices);

    users[userIndex].invoices.push(order);
    users[userIndex].cart = [];
    saveUsers(users);

    localStorage.removeItem(CART_KEY);

    checkoutMessage.textContent = "Invoice generated and saved successfully.";
    checkoutMessage.style.color = "green";

    setTimeout(() => {
      window.location.href = "invoice.html";
    }, 800);
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
      <td>JMD ${formatMoney(item.price)}</td>
      <td>JMD ${formatMoney(item.price * item.quantity)}</td>
    `;
    invoiceItems.appendChild(row);
  });

  document.getElementById("invoiceSubtotal").textContent = "JMD " + formatMoney(order.subtotal);
  document.getElementById("invoiceDiscount").textContent = "JMD " + formatMoney(order.discount);
  document.getElementById("invoiceTax").textContent = "JMD " + formatMoney(order.tax);
  document.getElementById("invoiceTotal").textContent = "JMD " + formatMoney(order.total);
  document.getElementById("invoiceAmountPaid").textContent = "JMD " + formatMoney(order.amountPaid);
  document.getElementById("invoiceBalance").textContent = "JMD " + formatMoney(order.balance);
}

renderInvoice();

// =========================
// PRINT INVOICE
// =========================
const printInvoiceBtn = document.getElementById("printInvoiceBtn");

if (printInvoiceBtn) {
  printInvoiceBtn.addEventListener("click", function () {
    window.print();
  });
}

// =========================
// DASHBOARD FUNCTIONS
// =========================
function renderBarLine(label, count, max) {
  const width = max === 0 ? 0 : Math.round((count / max) * 100);
  return `
    <div style="margin-bottom: 12px;">
      <strong>${label}: ${count}</strong>
      <div style="background:#e2e8f0;height:18px;border-radius:8px;overflow:hidden;margin-top:6px;">
        <div style="width:${width}%;height:100%;background:#14b8a6;"></div>
      </div>
    </div>
  `;
}

function ShowUserFrequency() {
  const genderFrequency = document.getElementById("genderFrequency");
  const ageFrequency = document.getElementById("ageFrequency");

  if (!genderFrequency || !ageFrequency) return;

  const users = getUsers();

  const genderCounts = {
    Male: 0,
    Female: 0,
    Other: 0
  };

  const ageCounts = {
    "18-25": 0,
    "26-35": 0,
    "36-50": 0,
    "50+": 0
  };

  users.forEach(user => {
    if (genderCounts[user.gender] !== undefined) {
      genderCounts[user.gender]++;
    }

    if (ageCounts[user.ageGroup] !== undefined) {
      ageCounts[user.ageGroup]++;
    }
  });

  const maxGender = Math.max(...Object.values(genderCounts), 0);
  const maxAge = Math.max(...Object.values(ageCounts), 0);

  genderFrequency.innerHTML =
    renderBarLine("Male", genderCounts.Male, maxGender) +
    renderBarLine("Female", genderCounts.Female, maxGender) +
    renderBarLine("Other", genderCounts.Other, maxGender);

  ageFrequency.innerHTML =
    renderBarLine("18-25", ageCounts["18-25"], maxAge) +
    renderBarLine("26-35", ageCounts["26-35"], maxAge) +
    renderBarLine("36-50", ageCounts["36-50"], maxAge) +
    renderBarLine("50+", ageCounts["50+"], maxAge);
}

function ShowInvoices(trn = "") {
  const resultsBox = document.getElementById("invoiceSearchResults");
  if (!resultsBox) return;

  const invoices = getAllInvoices();
  const filtered = trn ? invoices.filter(invoice => invoice.trn === trn) : invoices;

  if (filtered.length === 0) {
    resultsBox.innerHTML = "<p>No invoices found.</p>";
    console.log("No invoices found.");
    return;
  }

  let html = "<div class='table-wrapper'><table class='cart-table'><thead><tr><th>Invoice #</th><th>TRN</th><th>Date</th><th>Total</th></tr></thead><tbody>";
  filtered.forEach(invoice => {
    html += `
      <tr>
        <td>${invoice.invoiceNumber}</td>
        <td>${invoice.trn}</td>
        <td>${invoice.orderDate}</td>
        <td>JMD ${formatMoney(invoice.total)}</td>
      </tr>
    `;
    console.log(invoice);
  });
  html += "</tbody></table></div>";

  resultsBox.innerHTML = html;
}

function GetUserInvoices() {
  const currentUserInvoices = document.getElementById("currentUserInvoices");
  if (!currentUserInvoices) return;

  const currentUserTRN = getCurrentUserTRN();
  const users = getUsers();
  const currentUser = users.find(user => user.trn === currentUserTRN);

  if (!currentUser || !currentUser.invoices || currentUser.invoices.length === 0) {
    currentUserInvoices.innerHTML = "<p>No invoices found for the current user.</p>";
    return;
  }

  let html = "<div class='table-wrapper'><table class='cart-table'><thead><tr><th>Invoice #</th><th>Date</th><th>Total</th></tr></thead><tbody>";
  currentUser.invoices.forEach(invoice => {
    html += `
      <tr>
        <td>${invoice.invoiceNumber}</td>
        <td>${invoice.orderDate}</td>
        <td>JMD ${formatMoney(invoice.total)}</td>
      </tr>
    `;
  });
  html += "</tbody></table></div>";

  currentUserInvoices.innerHTML = html;
}

const searchInvoiceBtn = document.getElementById("searchInvoiceBtn");
if (searchInvoiceBtn) {
  searchInvoiceBtn.addEventListener("click", function () {
    const searchTrn = document.getElementById("searchTrn").value.trim();
    ShowInvoices(searchTrn);
  });
}

ShowUserFrequency();
GetUserInvoices();
