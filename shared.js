// ============================================================
// shared.js — Premium Ledger
// সকল পেজে ব্যবহৃত shared utilities
// ============================================================

const GAS_URL = "YOUR_GAS_WEBAPP_URL"; // 👈 Google Apps Script deploy URL বসাও

// ============================================================
// API CALL
// ============================================================
async function api(action, data = {}) {
  const session = getSession();
  const payload = { action, token: session ? session.token : null, ...data };
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

// ============================================================
// SESSION
// ============================================================
function getSession() {
  try { return JSON.parse(localStorage.getItem("pl_session")); } catch { return null; }
}
function setSession(data) { localStorage.setItem("pl_session", JSON.stringify(data)); }
function clearSession() { localStorage.removeItem("pl_session"); }

function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = "login.html"; return null; }
  return s;
}
function requireAdmin() {
  const s = getSession();
  if (!s) { window.location.href = "login.html"; return null; }
  if (s.role !== "admin") { window.location.href = "index.html"; return null; }
  return s;
}

// ============================================================
// NUMBER FORMAT
// ============================================================
function fmt(n) {
  const num = parseFloat(n) || 0;
  return num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ============================================================
// TOAST
// ============================================================
function toast(msg, type = "info") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3000);
}

// ============================================================
// NAVBAR RENDER
// ============================================================
function renderNav(active) {
  const session = getSession();
  if (!session) return;
  const isAdmin = session.role === "admin";

  const links = [
    { id: "index",   href: "index.html",   icon: "◈", label: "ড্যাশবোর্ড" },
    { id: "ledger",  href: "ledger.html",  icon: "⇅", label: "লেজার" },
    { id: "coin",    href: "coin.html",    icon: "◉", label: "কয়েন" },
    ...(isAdmin ? [{ id: "users", href: "users.html", icon: "⊙", label: "ইউজার" }] : [])
  ];

  const nav = document.getElementById("navbar");
  nav.innerHTML = `
    <nav class="navbar">
      <div class="nav-brand">
        <div class="nav-logo">💎</div>
        <span class="nav-title">Premium Ledger</span>
      </div>
      <div class="nav-links">
        ${links.map(l => `
          <a href="${l.href}" class="nav-link ${active === l.id ? "active" : ""}">
            <span class="nav-icon">${l.icon}</span>
            <span class="nav-label">${l.label}</span>
          </a>`).join("")}
      </div>
      <div class="nav-user">
        <div class="nav-avatar">${session.username[0].toUpperCase()}</div>
        <div class="nav-info">
          <span class="nav-name">${session.username}</span>
          <span class="nav-role ${session.role}">${session.role}</span>
        </div>
        <button class="nav-logout" onclick="doLogout()" title="লগআউট">⏻</button>
      </div>
    </nav>`;
}

async function doLogout() {
  await api("logout");
  clearSession();
  window.location.href = "login.html";
}
