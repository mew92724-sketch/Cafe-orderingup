"use strict";

// ---------------------------------------------------------------------------
// Tab switching — driven by data-tab attributes, no inline onclick handlers
// ---------------------------------------------------------------------------

const TAB_META = {
  overview: { title: "Overview", subtitle: document.currentScript?.dataset.username ? `Welcome back, ${document.currentScript.dataset.username}` : "Welcome back" },
  tables:   { title: "Tables", subtitle: "Manage table QR codes" },
  menu:     { title: "Menu Management", subtitle: "Add and edit your menu items" },
  orders:   { title: "Orders", subtitle: "Track and complete customer orders" },
};

function switchTab(tabId) {
  document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll("[data-tab]").forEach((el) => el.classList.remove("active"));

  const panel = document.getElementById("tab-" + tabId);
  if (panel) panel.classList.add("active");
  document.querySelectorAll(`[data-tab="${tabId}"]`).forEach((el) => el.classList.add("active"));

  const meta = TAB_META[tabId];
  if (meta) {
    const titleEl = document.getElementById("topbar-title");
    const subtitleEl = document.getElementById("topbar-subtitle");
    if (titleEl) titleEl.textContent = meta.title;
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;
  }

  history.replaceState(null, "", "#" + tabId);
}

// ---------------------------------------------------------------------------
// Edit form toggle — driven by data-edit-target attributes
// ---------------------------------------------------------------------------

function toggleEdit(formId) {
  const form = document.getElementById(formId);
  if (form) form.classList.toggle("open");
}

// ---------------------------------------------------------------------------
// Confirmation dialogs — driven by data-confirm attributes
// ---------------------------------------------------------------------------

function handleConfirmClicks(e) {
  const btn = e.target.closest("[data-confirm]");
  if (!btn) return;
  const msg = btn.getAttribute("data-confirm");
  if (msg && !window.confirm(msg)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// ---------------------------------------------------------------------------
// Event delegation for tab buttons
// ---------------------------------------------------------------------------

function handleTabClick(e) {
  const btn = e.target.closest("[data-tab]");
  if (!btn) return;
  const tabId = btn.getAttribute("data-tab");
  if (tabId && document.getElementById("tab-" + tabId)) {
    switchTab(tabId);
  }
}

// ---------------------------------------------------------------------------
// Event delegation for edit toggles
// ---------------------------------------------------------------------------

function handleEditToggle(e) {
  const btn = e.target.closest("[data-edit-target]");
  if (!btn) return;
  const target = btn.getAttribute("data-edit-target");
  if (target) toggleEdit(target);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", handleTabClick);
  document.addEventListener("click", handleEditToggle);
  document.addEventListener("click", handleConfirmClicks);

  // Restore tab from URL hash
  const hash = window.location.hash.replace("#", "");
  if (hash && TAB_META[hash]) {
    switchTab(hash);
  }
});
