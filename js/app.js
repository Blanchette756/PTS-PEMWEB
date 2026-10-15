const API_URL = 'https://dummyjson.com/products?limit=30';

let allProducts = [];

const timeElement = document.getElementById('last-update-time');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const statTotal = document.getElementById('stat-total');
const statAvgPrice = document.getElementById('stat-avg-price');
const statMaxPrice = document.getElementById('stat-max-price');
const statCategoryCount = document.getElementById('stat-category-count');

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
const errorBuyerName = document.getElementById('error-buyer-name');
const errorBuyerEmail = document.getElementById('error-buyer-email');
const errorConfirmEmail = document.getElementById('error-confirm-email');
const formSuccess = document.getElementById('form-success');

function formatTimestamp(date) {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    }).format(date);
}

function updateAnalytics(products) {
    if (!products.length) {
        statTotal.textContent = '0';
        statAvgPrice.textContent = '0.00';
        statMaxPrice.textContent = '-';
        statCategoryCount.textContent = '0';
        return;
    }

    statTotal.textContent = products.length.toString();

    const totalSum = products.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = totalSum / products.length;
    statAvgPrice.textContent = avgPrice.toFixed(2);

    const maxProduct = products.reduce((prev, curr) => (curr.price > prev.price ? curr : prev), products[0]);
    statMaxPrice.textContent = `${maxProduct.title} ($${maxProduct.price})`;

    const categories = products.map(item => item.category);
    const uniqueCategories = new Set(categories);
    statCategoryCount.textContent = uniqueCategories.size.toString();
}

function renderProducts(products) {
    productContainer.innerHTML = '';

    if (!products.length) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    products.forEach(item => {
        const card = document.createElement('article');
        card.className = 'product-card';

        const thumb = document.createElement('img');
        thumb.src = item.thumbnail;
        thumb.alt = item.title;
        thumb.className = 'product-thumb';
        thumb.loading = 'lazy';

        const body = document.createElement('div');
        body.className = 'product-body';

        const category = document.createElement('span');
        category.className = 'product-category';
        category.textContent = item.category;

        const title = document.createElement('h3');
        title.className = 'product-title';
        title.textContent = item.title;

        const desc = document.createElement('p');
        desc.className = 'product-desc';
        desc.textContent = item.description;

        const footer = document.createElement('div');
        footer.className = 'product-footer';

        const price = document.createElement('span');
        price.className = 'product-price';
        price.textContent = `$${item.price.toFixed(2)}`;

        const rating = document.createElement('span');
        rating.className = 'product-rating';
        rating.textContent = `★ ${item.rating.toFixed(1)}`;

        footer.appendChild(price);
        footer.appendChild(rating);

        body.appendChild(category);
        body.appendChild(title);
        body.appendChild(desc);
        body.appendChild(footer);

        card.appendChild(thumb);
        card.appendChild(body);

        productContainer.appendChild(card);
    });
}

function processAndDisplayProducts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const sortMode = sortSelect.value;

    let filtered = allProducts.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(keyword);
        const matchDesc = item.description.toLowerCase().includes(keyword);
        const matchCat = item.category.toLowerCase().includes(keyword);
        return matchTitle || matchDesc || matchCat;
    });

    if (sortMode === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'name-asc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'name-desc') {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortMode === 'rating-desc') {
        filtered.sort((a, b) => b.rating - a.rating);
    }

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

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        allProducts = Array.isArray(data.products) ? data.products : [];

        loadingIndicator.hidden = true;
        timeElement.textContent = formatTimestamp(new Date());

        processAndDisplayProducts();
    } catch (err) {
        loadingIndicator.hidden = true;
        errorBox.hidden = false;
        errorMessage.textContent = `Gagal memuat data: ${err.message}`;
    }
}

function validateEmailFormat(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function handleFormValidation(e) {
    e.preventDefault();

    let isValid = true;

    errorBuyerName.textContent = '';
    errorBuyerEmail.textContent = '';
    errorConfirmEmail.textContent = '';
    formSuccess.hidden = true;

    buyerName.classList.remove('invalid', 'valid');
    buyerEmail.classList.remove('invalid', 'valid');
    confirmEmail.classList.remove('invalid', 'valid');

    const nameValue = buyerName.value.trim();
    const emailValue = buyerEmail.value.trim();
    const confirmValue = confirmEmail.value.trim();

    if (!nameValue) {
        errorBuyerName.textContent = 'Nama lengkap wajib diisi.';
        buyerName.classList.add('invalid');
        isValid = false;
    } else {
        buyerName.classList.add('valid');
    }

    if (!emailValue) {
        errorBuyerEmail.textContent = 'Alamat email wajib diisi.';
        buyerEmail.classList.add('invalid');
        isValid = false;
    } else if (!validateEmailFormat(emailValue)) {
        errorBuyerEmail.textContent = 'Format alamat email tidak valid (contoh: user@domain.com).';
        buyerEmail.classList.add('invalid');
        isValid = false;
    } else {
        buyerEmail.classList.add('valid');
    }

    if (!confirmValue) {
        errorConfirmEmail.textContent = 'Konfirmasi email wajib diisi.';
        confirmEmail.classList.add('invalid');
        isValid = false;
    } else if (confirmValue !== emailValue) {
        errorConfirmEmail.textContent = 'Konfirmasi email tidak cocok dengan alamat email di atas.';
        confirmEmail.classList.add('invalid');
        isValid = false;
    } else {
        confirmEmail.classList.add('valid');
    }

    if (isValid) {
        formSuccess.hidden = false;
        orderForm.reset();
        setTimeout(() => {
            buyerName.classList.remove('valid');
            buyerEmail.classList.remove('valid');
            confirmEmail.classList.remove('valid');
        }, 3000);
    }
}

function setupEventListeners() {
    searchInput.addEventListener('input', processAndDisplayProducts);
    sortSelect.addEventListener('change', processAndDisplayProducts);
    btnRetry.addEventListener('click', fetchProductsData);
    orderForm.addEventListener('submit', handleFormValidation);

    orderForm.addEventListener('reset', () => {
        errorBuyerName.textContent = '';
        errorBuyerEmail.textContent = '';
        errorConfirmEmail.textContent = '';
        formSuccess.hidden = true;
        buyerName.classList.remove('invalid', 'valid');
        buyerEmail.classList.remove('invalid', 'valid');
        confirmEmail.classList.remove('invalid', 'valid');
    });

    buyerEmail.addEventListener('input', () => {
        if (confirmEmail.value) {
            if (buyerEmail.value !== confirmEmail.value) {
                errorConfirmEmail.textContent = 'Konfirmasi email tidak cocok.';
                confirmEmail.classList.add('invalid');
                confirmEmail.classList.remove('valid');
            } else {
                errorConfirmEmail.textContent = '';
                confirmEmail.classList.remove('invalid');
                confirmEmail.classList.add('valid');
            }
        }
    });

    confirmEmail.addEventListener('input', () => {
        if (confirmEmail.value !== buyerEmail.value) {
            errorConfirmEmail.textContent = 'Konfirmasi email tidak cocok dengan email utama.';
            confirmEmail.classList.add('invalid');
            confirmEmail.classList.remove('valid');
        } else {
            errorConfirmEmail.textContent = '';
            confirmEmail.classList.remove('invalid');
            confirmEmail.classList.add('valid');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchProductsData();
});
