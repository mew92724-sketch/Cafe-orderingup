const menuContainer = document.getElementById("menu-container");
const cartItemsEl = document.getElementById("cart-items");
const totalDisplay = document.getElementById("order-total");
const itemCountDisplay = document.getElementById("item-count");
const cartBadge = document.getElementById("cart-badge");
const checkoutForm = document.getElementById("checkout-form");
const responseBox = document.getElementById("checkout-response");
const tableIdInput = document.getElementById("table-id");
const clearCartButton = document.getElementById("clear-cart");
const searchInput = document.getElementById("menu-search");

let menuData = [];
let cart = [];

function fmt(amount) {
  return amount.toFixed(2);
}

function renderMenu() {
  const query = searchInput?.value.trim().toLowerCase() || "";
  if (!menuData.length) {
    menuContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No menu items available yet.</p>';
    return;
  }

  const filtered = menuData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (!query) return true;
        const text = `${item.name} ${item.description || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
        return text.includes(query) || cat.name.toLowerCase().includes(query);
      }),
    }))
    .filter((cat) => cat.items.length > 0);

  if (!filtered.length) {
    menuContainer.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No items match your search.</p>';
    return;
  }

  menuContainer.innerHTML = filtered
    .map(
      (cat) => `
      <div class="menu-category">
        <div class="menu-category-title">${cat.name}</div>
        <div class="menu-items">
          ${cat.items
            .map(
              (item) => `
            <div class="menu-item">
              <div class="menu-item-info">
                <h4>${item.name}</h4>
                ${item.description ? `<p class="item-desc">${item.description}</p>` : ""}
                ${
                  item.tags && item.tags.length
                    ? `<div class="item-tags">${item.tags.map((t) => `<span class="item-tag">${t}</span>`).join("")}</div>`
                    : ""
                }
              </div>
              <div class="menu-item-right">
                <span class="item-price">$${fmt(item.price)}</span>
                <button class="add-btn" data-id="${item.id}">+ Add</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
    )
    .join("");

  menuContainer.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

function renderCart() {
  const totalItems = cart.reduce((s, e) => s + e.quantity, 0);
  const total = cart.reduce((s, e) => s + e.lineTotal, 0);

  if (cartBadge) cartBadge.textContent = totalItems;
  if (itemCountDisplay) itemCountDisplay.textContent = totalItems;
  if (totalDisplay) totalDisplay.textContent = fmt(total);

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem;text-align:center;padding:1rem 0;">Your cart is empty</p>';
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (entry) => `
      <div class="cart-item">
        <div class="cart-item-name">${entry.name}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-id="${entry.id}">−</button>
          <span class="qty-value">${entry.quantity}</span>
          <button class="qty-btn" data-action="increase" data-id="${entry.id}">+</button>
        </div>
        <span class="cart-item-total">$${fmt(entry.lineTotal)}</span>
        <button class="remove-btn" data-action="remove" data-id="${entry.id}" title="Remove">✕</button>
      </div>
    `
    )
    .join("");

  cartItemsEl.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const action = el.dataset.action;
      if (action === "increase") changeQty(id, 1);
      else if (action === "decrease") changeQty(id, -1);
      else if (action === "remove") removeItem(id);
    });
  });
}

function addToCart(itemId) {
  const item = menuData.flatMap((c) => c.items).find((i) => i.id === itemId);
  if (!item) return;
  const existing = cart.find((e) => e.id === itemId);
  if (existing) {
    existing.quantity += 1;
    existing.lineTotal = existing.quantity * existing.price;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1, lineTotal: item.price });
  }
  renderCart();
}

function changeQty(itemId, delta) {
  const entry = cart.find((e) => e.id === itemId);
  if (!entry) return;
  entry.quantity = Math.max(1, entry.quantity + delta);
  entry.lineTotal = entry.quantity * entry.price;
  renderCart();
}

function removeItem(itemId) {
  cart = cart.filter((e) => e.id !== itemId);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

async function loadMenu() {
  try {
    const res = await fetch("/api/menu?v=" + Date.now(), {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) throw new Error("Failed to load menu.");
    const data = await res.json();
    menuData = data.categories || [];
    renderMenu();
  } catch (err) {
    menuContainer.innerHTML = `<p style="color:var(--danger);text-align:center;padding:2rem;">${err.message}</p>`;
  }
}

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!cart.length) {
    showResponse("Please add items to your order before checking out.", "error");
    return;
  }

  const customerName = document.getElementById("customer-name").value.trim() || "Guest";
  const tableId = tableIdInput.value;
  const payload = {
    customerName,
    tableId,
    items: cart.map((entry) => ({ id: entry.id, quantity: entry.quantity })),
  };

  const submitBtn = checkoutForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Placing order…";

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      showResponse(json.description || "Failed to place order.", "error");
    } else {
      showResponse(`Order #${json.order.id} placed! Your items will be ready shortly. 🎉`, "success");
      cart = [];
      renderCart();
      checkoutForm.reset();
    }
  } catch (err) {
    showResponse("Network error. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Place Order";
  }
});

function showResponse(msg, type) {
  responseBox.textContent = msg;
  responseBox.className = "checkout-response visible " + (type === "error" ? "alert alert-error" : "alert alert-success");
}

clearCartButton?.addEventListener("click", clearCart);
searchInput?.addEventListener("input", renderMenu);

loadMenu();
