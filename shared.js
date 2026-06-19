// ============================================================
// shared.js — Premium Ledger
// সকল পেজে ব্যবহৃত shared utilities
// ============================================================

const GAS_URL = "https://script.google.com/macros/s/AKfycbz0MtYlD4hekwT6qAVVnZuJRsfEnahWTXCu9novpjYZkF3TRA-Ca-d677dPYOEyXHS4/exec"; // 👈 Google Apps Script deploy URL বসাও

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
    { id: "index",        href: "index.html",        icon: "◈", label: "ড্যাশবোর্ড" },
    { id: "ledger",       href: "ledger.html",       icon: "⇅", label: "লেজার" },
    { id: "coin",         href: "coin.html",         icon: "◉", label: "কয়েন" },
    { id: "transactions", href: "transactions.html", icon: "⏱", label: "লেনদেন" },
    ...(isAdmin ? [{ id: "users", href: "users.html", icon: "⊙", label: "ইউজার" }] : [])
  ];

  const nav = document.getElementById("navbar");
  nav.innerHTML = `
    <style>
      .navbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 100;
        display: flex; align-items: center; gap: 6px;
        padding: 0 16px;
        height: 60px;
        background: rgba(3,7,18,.88);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255,255,255,.07);
      }
      .nav-brand {
        display: flex; align-items: center; gap: 9px;
        margin-right: 6px; text-decoration: none; flex-shrink: 0;
      }
      .nav-logo {
        width: 30px; height: 30px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        font-size: 15px;
        box-shadow: 0 4px 12px rgba(99,102,241,.4);
      }
      .nav-title {
        font-size: 13px; font-weight: 800; letter-spacing: -.3px;
        background: linear-gradient(135deg, #c7d2fe, #818cf8);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        display: none;
      }
      @media (min-width: 520px) { .nav-title { display: block; } }

      .nav-links {
        display: flex; align-items: center; gap: 2px; flex: 1;
        overflow-x: auto; scrollbar-width: none;
      }
      .nav-links::-webkit-scrollbar { display: none; }

      .nav-link {
        display: flex; align-items: center; gap: 5px;
        padding: 6px 10px; border-radius: 10px;
        text-decoration: none; color: #94a3b8;
        font-size: 12px; font-weight: 600; letter-spacing: .2px;
        transition: all .2s; white-space: nowrap; flex-shrink: 0;
      }
      .nav-link:hover { color: #f0f4ff; background: rgba(255,255,255,.05); }
      .nav-link.active {
        color: #818cf8;
        background: rgba(99,102,241,.12);
        border: 1px solid rgba(99,102,241,.2);
      }
      .nav-icon { font-size: 13px; }
      .nav-label { display: none; }
      @media (min-width: 440px) { .nav-label { display: inline; } }

      .nav-user {
        display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0;
      }
      .nav-avatar {
        width: 30px; height: 30px; border-radius: 9px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
      }
      .nav-info { display: none; flex-direction: column; }
      @media (min-width: 640px) { .nav-info { display: flex; } }
      .nav-name { font-size: 12px; font-weight: 700; }
      .nav-role {
        font-size: 10px; font-weight: 700; letter-spacing: .5px;
        padding: 1px 6px; border-radius: 20px;
      }
      .nav-role.admin { background: rgba(99,102,241,.2); color: #818cf8; }
      .nav-role.user  { background: rgba(52,211,153,.15); color: #34d399; }

      /* ── লগআউট বাটন — সব স্ক্রিনে দেখাবে, মোবাইলে ছোট ─ */
      .nav-logout {
        width: 32px; height: 32px; border-radius: 10px;
        border: 1px solid rgba(248,113,113,.2);
        background: rgba(248,113,113,.08);
        color: #f87171; cursor: pointer; font-size: 16px;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; flex-shrink: 0;
        position: relative;
      }
      .nav-logout:hover {
        background: rgba(248,113,113,.18);
        border-color: rgba(248,113,113,.4);
        transform: scale(1.08);
      }
      .nav-logout::after {
        content: "লগআউট";
        position: absolute; top: calc(100% + 6px); right: 0;
        background: rgba(10,22,40,.95); border: 1px solid rgba(248,113,113,.25);
        color: #f87171; font-size: 11px; font-weight: 700;
        padding: 4px 10px; border-radius: 8px;
        white-space: nowrap; pointer-events: none;
        opacity: 0; transition: opacity .18s; z-index: 200;
        font-family: 'Syne', sans-serif;
      }
      .nav-logout:hover::after { opacity: 1; }
    </style>

    <nav class="navbar">
      <a href="index.html" class="nav-brand">
        <div class="nav-logo">💎</div>
        <span class="nav-title">Premium Ledger</span>
      </a>
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
