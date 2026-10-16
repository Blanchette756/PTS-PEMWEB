const API_URL = 'https://dummyjson.com/products?limit=30';

let allProducts = [];
let selectedCategory = 'all';
let statItems = [];
let currentStatIndex = 0;
let statSlideTimer = null;

const timeEl = document.getElementById('last-update-time');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const statsSection = document.querySelector('.stats-section');
const btnStatPrev = document.getElementById('btn-stat-prev');
const btnStatNext = document.getElementById('btn-stat-next');
const statLabel = document.getElementById('stat-slide-label');
const statValue = document.getElementById('stat-slide-value');
const statDesc = document.getElementById('stat-slide-desc');
const statDots = document.getElementById('stat-dots');
const categoryPills = document.getElementById('category-pills');

const loadingIndicator = document.getElementById('loading-indicator');
const errorBox = document.getElementById('error-box');
const errorMessage = document.getElementById('error-message');
const btnRetry = document.getElementById('btn-retry');
const emptyState = document.getElementById('empty-state');
const productContainer = document.getElementById('product-container');

const orderForm = document.getElementById('order-form');
const buyerName = document.getElementById('buyer-name');
const buyerEmail = document.getElementById('buyer-email');
const confirmEmail = document.getElementById('confirm-email');
const errName = document.getElementById('error-buyer-name');
const errEmail = document.getElementById('error-buyer-email');
const errConfirm = document.getElementById('error-confirm-email');
const formSuccess = document.getElementById('form-success');

function formatTimestamp(date) {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }).format(date);
}

function displayStatSlide(index) {
    if (!statItems.length) return;
    currentStatIndex = (index + statItems.length) % statItems.length;
    const item = statItems[currentStatIndex];
    statLabel.textContent = item.label;
    statValue.textContent = item.value;
    statDesc.textContent = item.desc;
    statDots.querySelectorAll('.stat-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentStatIndex);
    });
}

function renderStatDots() {
    statDots.innerHTML = '';
    statItems.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `stat-dot ${idx === currentStatIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Slide ${idx + 1}`);
        dot.addEventListener('click', () => { displayStatSlide(idx); startStatTimer(); });
        statDots.appendChild(dot);
    });
}

function startStatTimer() {
    stopStatTimer();
    statSlideTimer = setInterval(() => displayStatSlide(currentStatIndex + 1), 3500);
}

function stopStatTimer() {
    if (statSlideTimer) clearInterval(statSlideTimer);
}

function updateAnalytics(products) {
    if (!products.length) {
        statItems = [{ label: 'Total Produk', value: '0 Item', desc: 'Tidak ada data produk' }];
        displayStatSlide(0);
        renderStatDots();
        return;
    }

    const totalSum = products.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = (totalSum / products.length).toFixed(2);
    const maxProduct = products.reduce((prev, curr) => curr.price > prev.price ? curr : prev, products[0]);
    const minProduct = products.reduce((prev, curr) => curr.price < prev.price ? curr : prev, products[0]);
    const topRated = products.reduce((prev, curr) => curr.rating > prev.rating ? curr : prev, products[0]);
    const categories = new Set(products.map(item => item.category));

    statItems = [
        { label: 'Total Produk', value: `${products.length} Item`, desc: 'Produk aktif dalam katalog' },
        { label: 'Rata-rata Harga', value: `$${avgPrice}`, desc: 'Dihitung dari seluruh produk terpilih' },
        { label: 'Produk Termahal', value: `$${maxProduct.price} (${maxProduct.title})`, desc: 'Harga tertinggi di katalog' },
        { label: 'Produk Termurah', value: `$${minProduct.price} (${minProduct.title})`, desc: 'Harga paling terjangkau' },
        { label: 'Variasi Kategori', value: `${categories.size} Kategori`, desc: 'Ragam kelompok usaha UMKM' },
        { label: 'Rating Tertinggi', value: `★ ${topRated.rating.toFixed(1)} (${topRated.title})`, desc: 'Ulasan pembeli terbaik' }
    ];

    displayStatSlide(currentStatIndex);
    renderStatDots();
    startStatTimer();
}

function renderCategoryPills(categories) {
    categoryPills.innerHTML = '';
    const all = ['all', ...categories];
    all.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pill-btn ${selectedCategory === cat ? 'active' : ''}`;
        btn.textContent = cat === 'all' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1);
        btn.addEventListener('click', () => {
            selectedCategory = cat;
            categoryPills.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b === btn));
            processAndDisplayProducts();
        });
        categoryPills.appendChild(btn);
    });
}

function renderProducts(products) {
    productContainer.innerHTML = '';
    emptyState.hidden = products.length > 0;
    if (!products.length) return;

    products.forEach(item => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}" class="product-thumb" loading="lazy">
            <div class="product-body">
                <span class="product-category">${item.category}</span>
                <h3 class="product-title">${item.title}</h3>
                <p class="product-desc">${item.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${item.price.toFixed(2)}</span>
                    <span class="product-rating">★ ${item.rating.toFixed(1)}</span>
                </div>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

function processAndDisplayProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    let filtered = allProducts.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(keyword) ||
                            item.description.toLowerCase().includes(keyword) ||
                            item.category.toLowerCase().includes(keyword);
        const matchCategory = selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchSearch && matchCategory;
    });

    if (sortMode === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sortMode === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sortMode === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortMode === 'name-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortMode === 'rating-desc') filtered.sort((a, b) => b.rating - a.rating);

    renderProducts(filtered);
    updateAnalytics(filtered);
}

async function fetchProductsData() {
    loadingIndicator.hidden = false;
    errorBox.hidden = true;
    emptyState.hidden = true;
    productContainer.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        allProducts = Array.isArray(data.products) ? data.products : [];
        loadingIndicator.hidden = true;
        timeEl.textContent = formatTimestamp(new Date());

        const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category)));
        renderCategoryPills(uniqueCategories);
        processAndDisplayProducts();
    } catch (err) {
        loadingIndicator.hidden = true;
        errorBox.hidden = false;
        errorMessage.textContent = `Gagal memuat data: ${err.message}`;
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleFormValidation(e) {
    e.preventDefault();
    let isValid = true;

    errName.textContent = '';
    errEmail.textContent = '';
    errConfirm.textContent = '';
    formSuccess.hidden = true;

    const name = buyerName.value.trim();
    const email = buyerEmail.value.trim();
    const confirm = confirmEmail.value.trim();

    if (!name) {
        errName.textContent = 'Nama lengkap wajib diisi.';
        buyerName.classList.add('invalid');
        isValid = false;
    } else {
        buyerName.classList.remove('invalid');
        buyerName.classList.add('valid');
    }

    if (!email) {
        errEmail.textContent = 'Alamat email wajib diisi.';
        buyerEmail.classList.add('invalid');
        isValid = false;
    } else if (!validateEmail(email)) {
        errEmail.textContent = 'Format email tidak valid.';
        buyerEmail.classList.add('invalid');
        isValid = false;
    } else {
        buyerEmail.classList.remove('invalid');
        buyerEmail.classList.add('valid');
    }

    if (!confirm) {
        errConfirm.textContent = 'Konfirmasi email wajib diisi.';
        confirmEmail.classList.add('invalid');
        isValid = false;
    } else if (confirm !== email) {
        errConfirm.textContent = 'Konfirmasi email tidak cocok.';
        confirmEmail.classList.add('invalid');
        isValid = false;
    } else {
        confirmEmail.classList.remove('invalid');
        confirmEmail.classList.add('valid');
    }

    if (isValid) {
        formSuccess.hidden = false;
        orderForm.reset();
    }
}

function checkEmailMatch() {
    if (!confirmEmail.value) return;
    const match = confirmEmail.value === buyerEmail.value;
    errConfirm.textContent = match ? '' : 'Konfirmasi email tidak cocok.';
    confirmEmail.classList.toggle('invalid', !match);
    confirmEmail.classList.toggle('valid', match);
}

function setupEventListeners() {
    searchInput.addEventListener('input', processAndDisplayProducts);
    sortSelect.addEventListener('change', processAndDisplayProducts);
    btnRetry.addEventListener('click', fetchProductsData);
    orderForm.addEventListener('submit', handleFormValidation);

    orderForm.addEventListener('reset', () => {
        errName.textContent = '';
        errEmail.textContent = '';
        errConfirm.textContent = '';
        formSuccess.hidden = true;
        [buyerName, buyerEmail, confirmEmail].forEach(input => input.classList.remove('invalid', 'valid'));
    });

    btnStatPrev.addEventListener('click', () => { displayStatSlide(currentStatIndex - 1); startStatTimer(); });
    btnStatNext.addEventListener('click', () => { displayStatSlide(currentStatIndex + 1); startStatTimer(); });

    if (statsSection) {
        statsSection.addEventListener('mouseenter', stopStatTimer);
        statsSection.addEventListener('mouseleave', startStatTimer);
    }

    buyerEmail.addEventListener('input', checkEmailMatch);
    confirmEmail.addEventListener('input', checkEmailMatch);
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchProductsData();
});
