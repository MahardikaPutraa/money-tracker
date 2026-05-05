const transactions = [
  { title: "Gaji Bulan Maret", subtitle: "Gaji - 10 Maret 2026", amount: 15000000, type: "Pemasukan", category: "Gaji" },
  { title: "Freelance UI Kit", subtitle: "Bonus - 08 Maret 2026", amount: 3300000, type: "Pemasukan", category: "Bonus" },
  { title: "Belanja Bulanan", subtitle: "Makanan - 14 Maret 2026", amount: -150000, type: "Pengeluaran", category: "Makanan" },
  { title: "Tagihan Internet", subtitle: "Tagihan - 18 Maret 2026", amount: -350000, type: "Pengeluaran", category: "Tagihan" },
  { title: "Transportasi Kantor", subtitle: "Transportasi - 21 Maret 2026", amount: -120000, type: "Pengeluaran", category: "Transportasi" },
  { title: "Bonus Tahunan", subtitle: "Bonus - 01 Maret 2026", amount: 2500000, type: "Pemasukan", category: "Bonus" },
  { title: "Makan Siang Tim", subtitle: "Makanan - 22 Maret 2026", amount: -210000, type: "Pengeluaran", category: "Makanan" },
  { title: "Pendapatan Investasi", subtitle: "Investasi - 03 Maret 2026", amount: 1100000, type: "Pemasukan", category: "Investasi" },
  { title: "Belanja Harian", subtitle: "Belanja - 26 Maret 2026", amount: -480000, type: "Pengeluaran", category: "Belanja" },
  { title: "Top Up Tabungan", subtitle: "Gaji - 29 Maret 2026", amount: 1400000, type: "Pemasukan", category: "Gaji" }
];

const areaSeries = [
  { label: "Desember", value: 2500000 },
  { label: "Januari", value: 10000000 },
  { label: "Februari", value: 15000000 },
  { label: "Maret", value: 10000000 }
];

const compareSeries = [
  { label: "Oktober", income: 25000000, expense: 10000000 },
  { label: "November", income: 30000000, expense: 20000000 },
  { label: "Desember", income: 20000000, expense: 15000000 },
  { label: "Januari", income: 40000000, expense: 25000000 },
  { label: "Februari", income: 35000000, expense: 25000000 },
  { label: "Maret", income: 30000000, expense: 10000000 }
];

const donutSeries = [
  { label: "Belanja", value: 26, color: "#1653B5" },
  { label: "Makan", value: 18, color: "#8751ED" },
  { label: "Liburan", value: 18, color: "#10C260" },
  { label: "Kesehatan", value: 13, color: "#FF7A21" },
  { label: "Transportasi", value: 9, color: "#FF3434" },
  { label: "Tagihan", value: 16, color: "#43A8E6" }
];

const SESSION_KEY = "luxentra_session";
const protectedPages = new Set(["dashboard", "transactions", "new-transaction", "settings"]);
const authPages = new Set(["login", "register"]);

function getCurrentPage() {
  return document.body?.dataset.page || "";
}

function readStoredSession() {
  let localSession = "";

  try {
    localSession = window.localStorage.getItem(SESSION_KEY) || "";
  } catch (error) {
    localSession = "";
  }

  return localSession || (window.name.startsWith(`${SESSION_KEY}=`) ? window.name.slice(SESSION_KEY.length + 1) : "");
}

function writeStoredSession(value) {
  try {
    window.localStorage.setItem(SESSION_KEY, value);
    window.name = `${SESSION_KEY}=${value}`;
  } catch (error) {
    window.name = `${SESSION_KEY}=${value}`;
  }
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    // Fallback below handles browsers that block localStorage on file previews.
  }

  if (window.name.startsWith(`${SESSION_KEY}=`)) {
    window.name = "";
  }
}

function getSession() {
  const rawSession = readStoredSession();
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch (error) {
    clearStoredSession();
    return null;
  }
}

function createSession(payload = {}) {
  const email = payload.email?.trim() || "pengguna@luxentra.app";
  const fallbackName = email.split("@")[0].replace(/[._-]+/g, " ");
  const safeName = payload.name?.trim() || fallbackName || "Pengguna";
  const normalizedName = safeName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const session = {
    name: normalizedName || "Pengguna",
    email,
    createdAt: new Date().toISOString()
  };

  writeStoredSession(JSON.stringify(session));
  return session;
}

function redirectTo(path) {
  window.location.href = path;
}

function initSessionRouting() {
  const page = getCurrentPage();
  const session = getSession();

  if (protectedPages.has(page) && !session) {
    redirectTo("login.html");
    return null;
  }

  return session;
}

function initAuthForms() {
  const page = getCurrentPage();
  const form = document.querySelector(".auth-form");
  if (!form || !authPages.has(page)) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const textInput = form.querySelector('input[type="text"]');

    createSession({
      email: emailInput?.value,
      name: page === "register" ? textInput?.value : ""
    });

    redirectTo("dashboard.html");
  });

  const googleButton = form.querySelector(".button--google");
  if (googleButton) {
    googleButton.addEventListener("click", () => {
      createSession({
        name: "Pengguna Google",
        email: "google.user@luxentra.app"
      });
      redirectTo("dashboard.html");
    });
  }
}

function initLogout() {
  const logoutButton = document.querySelector(".sidebar-exit");
  if (!logoutButton) return;

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    clearStoredSession();
    redirectTo("index.html");
  });
}

function hydrateUserProfile(session) {
  if (!session) return;

  const sidebarLabel = document.querySelector(".brand small");
  if (sidebarLabel) {
    sidebarLabel.textContent = session.name;
  }

  const profileName = document.querySelector(".profile-card__copy h3");
  if (profileName) {
    profileName.textContent = session.name;
  }

  const profileEmail = document.querySelector(".profile-card__copy p");
  if (profileEmail) {
    profileEmail.textContent = session.email;
  }

  const profileAvatar = document.querySelector(".profile-avatar");
  if (profileAvatar) {
    profileAvatar.textContent = session.name.charAt(0).toUpperCase();
  }
}

function formatCurrency(value) {
  const formatted = Math.abs(value).toLocaleString("id-ID");
  return `${value < 0 ? "-Rp" : "Rp"} ${formatted}`;
}

function renderTransactionItem(item) {
  const isIncome = item.amount > 0;
  const icon = isIncome ? "↗" : "↘";
  return `
    <article class="transaction-item" data-type="${item.type}" data-category="${item.category}" data-amount="${item.amount}">
      <div class="transaction-item__icon ${isIncome ? "transaction-item__icon--income" : "transaction-item__icon--expense"}">${icon}</div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.subtitle}</p>
      </div>
      <strong class="${isIncome ? "income" : "expense"}">${formatCurrency(item.amount)}</strong>
    </article>
  `;
}

function renderAreaChart() {
  const container = document.getElementById("areaChart");
  if (!container) return;

  const width = 760;
  const height = 360;
  const padding = 48;
  const maxValue = Math.max(...areaSeries.map((point) => point.value));
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 1.6;

  const points = areaSeries.map((point, index) => {
    const x = padding + (usableWidth / (areaSeries.length - 1)) * index;
    const y = height - padding - (point.value / maxValue) * usableHeight;
    return { ...point, x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend keuangan bulanan">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E6545D" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#E6545D" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#areaFill)"></path>
      <path d="${linePath}" fill="none" stroke="#111111" stroke-width="3"></path>
      ${points
        .map(
          (point) => `
            <circle cx="${point.x}" cy="${point.y}" r="7" fill="#111111"></circle>
            <text x="${point.x}" y="${height - 8}" text-anchor="middle" fill="#1f2937" font-size="18">${point.label}</text>
          `
        )
        .join("")}
    </svg>
  `;
}

function renderBarChart() {
  const container = document.getElementById("barChart");
  if (!container) return;

  const width = 980;
  const height = 360;
  const maxValue = Math.max(...compareSeries.flatMap((item) => [item.income, item.expense]));
  const baseY = 300;
  const left = 70;
  const groupWidth = 130;
  const barWidth = 32;

  const bars = compareSeries
    .map((item, index) => {
      const x = left + index * groupWidth;
      const incomeHeight = (item.income / maxValue) * 220;
      const expenseHeight = (item.expense / maxValue) * 220;
      return `
        <rect x="${x}" y="${baseY - incomeHeight}" width="${barWidth}" height="${incomeHeight}" rx="10" fill="#2AAD1F"></rect>
        <rect x="${x + 40}" y="${baseY - expenseHeight}" width="${barWidth}" height="${expenseHeight}" rx="10" fill="#FF1616"></rect>
        <text x="${x + 36}" y="${baseY + 34}" text-anchor="middle" fill="#1f2937" font-size="18">${item.label}</text>
      `;
    })
    .join("");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Perbandingan pemasukan dan pengeluaran">
      ${[0, 1, 2, 3, 4, 5]
        .map((row) => {
          const y = 300 - row * 44;
          return `<line x1="50" y1="${y}" x2="${width - 30}" y2="${y}" stroke="#E5E7EB" stroke-width="2"></line>`;
        })
        .join("")}
      ${bars}
      <rect x="320" y="326" width="16" height="16" rx="8" fill="#2AAD1F"></rect>
      <text x="344" y="340" fill="#2AAD1F" font-size="18">Pemasukan</text>
      <rect x="462" y="326" width="16" height="16" rx="8" fill="#FF1616"></rect>
      <text x="486" y="340" fill="#FF1616" font-size="18">Pengeluaran</text>
    </svg>
  `;
}

function renderDonut() {
  const chart = document.getElementById("donutChart");
  const legend = document.getElementById("donutLegend");
  if (!chart || !legend) return;

  const gradient = donutSeries
    .map((item, index) => {
      const start = donutSeries.slice(0, index).reduce((sum, current) => sum + current.value, 0);
      return `${item.color} ${start}% ${start + item.value}%`;
    })
    .join(", ");

  chart.style.background = `conic-gradient(${gradient})`;
  legend.innerHTML = donutSeries
    .map(
      (item) => `
        <li>
          <span><i class="legend-dot" style="background:${item.color}"></i>${item.label}</span>
          <strong>${item.value}%</strong>
        </li>
      `
    )
    .join("");
}

function renderRecentTransactions() {
  const container = document.getElementById("recentTransactions");
  if (!container) return;
  container.innerHTML = transactions.slice(0, 5).map(renderTransactionItem).join("");
}

function renderTransactionsPage(filteredItems = transactions) {
  const container = document.getElementById("transactionsList");
  if (!container) return;
  container.innerHTML = filteredItems.map(renderTransactionItem).join("");
}

function initTransactionFilters() {
  const form = document.getElementById("transactionFilters");
  if (!form) return;

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const typeFilter = document.getElementById("typeFilter");
  const sortField = document.getElementById("sortField");
  const sortDirection = document.getElementById("sortDirection");
  const resetButton = document.getElementById("resetFilters");

  function applyFilters() {
    let next = [...transactions];

    if (searchInput.value.trim()) {
      const query = searchInput.value.trim().toLowerCase();
      next = next.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query));
    }

    if (categoryFilter.value) {
      next = next.filter((item) => item.category === categoryFilter.value);
    }

    if (typeFilter.value) {
      next = next.filter((item) => item.type === typeFilter.value);
    }

    next.sort((a, b) => {
      const multiplier = sortDirection.value === "asc" ? 1 : -1;
      if (sortField.value === "amount") {
        return (Math.abs(a.amount) - Math.abs(b.amount)) * multiplier;
      }
      return a.subtitle.localeCompare(b.subtitle) * multiplier;
    });

    renderTransactionsPage(next);
  }

  [searchInput, categoryFilter, typeFilter, sortField, sortDirection].forEach((element) => {
    element.addEventListener("input", applyFilters);
    element.addEventListener("change", applyFilters);
  });

  resetButton.addEventListener("click", () => {
    form.reset();
    renderTransactionsPage(transactions);
  });

  renderTransactionsPage(transactions);
}

function initMenu() {
  const topbar = document.querySelector(".topbar");
  const menuToggle = document.querySelector(".menu-toggle");
  if (!topbar || !menuToggle) return;
  menuToggle.addEventListener("click", () => {
    topbar.classList.toggle("is-open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const page = getCurrentPage();
  const session = initSessionRouting();
  if (page && !session && protectedPages.has(page)) {
    return;
  }

  initAuthForms();
  initLogout();
  hydrateUserProfile(session);
  initMenu();
  renderAreaChart();
  renderBarChart();
  renderDonut();
  renderRecentTransactions();
  initTransactionFilters();
});
