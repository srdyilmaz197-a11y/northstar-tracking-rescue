(() => {
  const products = {
    "Trail Pack 28L": 129,
    "Field Bottle 24oz": 38,
    "Basecamp Blanket": 89
  };
  const sourceLabels = {
    google: "Google Ads",
    meta: "Meta Ads",
    email: "Email campaign",
    organic: "Organic search",
    direct: "Direct visit"
  };
  const sourceValues = {
    google: "google / cpc",
    meta: "facebook / paid_social",
    email: "newsletter / email",
    organic: "google / organic",
    direct: "direct / none"
  };
  let cart = [];
  let mode = "fixed";
  let toastTimer;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const cartDrawer = $("#cartDrawer");
  const backdrop = $("#drawerBackdrop");
  const checkoutDialog = $("#checkoutDialog");

  function money(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  }

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function openCart() {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    document.body.classList.add("locked");
    $("#closeCart").focus();
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    document.body.classList.remove("locked");
  }

  function renderCart() {
    const list = $("#cartItems");
    list.innerHTML = "";
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `<div class="cart-thumb"></div><div><b>${item.name}</b><small>Olive · Qty 1</small><button class="remove-item" data-index="${index}">Remove</button></div><strong>${money(item.price)}</strong>`;
      list.appendChild(row);
    });
    $("#cartCount").textContent = cart.length;
    $("#cartEmpty").hidden = cart.length > 0;
    $("#cartFooter").hidden = cart.length === 0;
    $("#cartSubtotal").textContent = money(cart.reduce((sum, item) => sum + item.price, 0));
    $$(".remove-item").forEach((button) => button.addEventListener("click", () => {
      cart.splice(Number(button.dataset.index), 1);
      renderCart();
    }));
  }

  function addProduct(name, price, shouldOpen = true) {
    cart.push({ name, price });
    renderCart();
    toast(`${name} added to your bag`);
    if (shouldOpen) openCart();
  }

  function openCheckout() {
    closeCart();
    const source = $("#sourceSelect").value;
    $("#checkoutSource").textContent = sourceLabels[source];
    if (typeof checkoutDialog.showModal === "function") checkoutDialog.showModal();
  }

  function resetProof() {
    $("#proofHeadline").textContent = "RUNNING THE CUSTOMER JOURNEY…";
    $("#proofSummary").textContent = "Product viewed → added to cart → checkout started. Complete the test order to compare the receipt with analytics.";
  }

  function completeOrder() {
    const source = $("#sourceSelect").value;
    const fixed = mode === "fixed";
    const orderId = `NS-${String(Math.floor(1000 + Math.random() * 8999))}`;
    checkoutDialog.close();

    $("#orderId").textContent = orderId;
    $("#orderRevenue").textContent = "$129.00";
    $("#orderCurrency").textContent = "USD";
    $("#analyticsId").textContent = fixed ? orderId : "auto-" + Date.now().toString().slice(-5);
    $("#analyticsRevenue").textContent = fixed ? "$129.00" : "$258.00";
    $("#analyticsSource").textContent = fixed ? sourceValues[source] : "direct / none";
    $("#analyticsPurchases").textContent = fixed ? "1" : "2";

    const score = fixed ? 8 : 1;
    $("#proofHeadline").textContent = fixed ? "THE ORDER AND ANALYTICS MATCH." : "THE REPORT CANNOT BE TRUSTED.";
    $("#proofSummary").textContent = fixed
      ? "One customer created one real order. Analytics recorded it once, with the same transaction ID, revenue, currency and original traffic source."
      : "One real order became two analytics purchases. The transaction ID changed, revenue doubled and the original traffic source disappeared.";

    const ring = $("#scoreRing");
    ring.className = "score-ring " + (fixed ? "success" : "fail");
    ring.querySelector("strong").textContent = score;
    const mark = $("#reconcileMark");
    mark.className = "reconcile-mark " + (fixed ? "success" : "fail");
    mark.textContent = fixed ? "MATCH" : "FAIL";

    $$("#checkGrid span").forEach((item, index) => {
      const passed = fixed || index === 4;
      item.className = passed ? "pass" : "fail";
      item.textContent = (passed ? "✓ " : "× ") + item.textContent.replace(/^[○✓×]\s*/, "");
    });
    cart = [];
    renderCart();
    $("#proof").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(fixed ? "Test complete: 8 of 8 checks passed" : "Broken tracking reproduced: 1 of 8 checks passed");
  }

  $$(".add-button").forEach((button) => button.addEventListener("click", () => addProduct(button.dataset.product, Number(button.dataset.price))));
  $("#cartButton").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  $("#checkoutButton").addEventListener("click", openCheckout);
  $("#closeCheckout").addEventListener("click", () => checkoutDialog.close());

  $$(".mode-switch button").forEach((button) => button.addEventListener("click", () => {
    mode = button.dataset.mode;
    $$(".mode-switch button").forEach((b) => b.classList.toggle("active", b === button));
  }));

  $("#runDemo").addEventListener("click", () => {
    cart = [{ name: "Trail Pack 28L", price: products["Trail Pack 28L"] }];
    renderCart();
    resetProof();
    openCheckout();
  });

  $("#checkoutForm").addEventListener("submit", (event) => {
    event.preventDefault();
    completeOrder();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
  });

  renderCart();
})();
