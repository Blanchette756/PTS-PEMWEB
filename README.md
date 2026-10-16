# PTS Pemrograman Web - Mini Project Front-End

### Identitas
* **Nama :** Rizky Rahmad Dani
* **NPM :** 2440304001
* **MK :** Pemrograman Web

---

### Deskripsi Project
Aplikasi dashboard interaktif **UMKM Nusantara** untuk melihat katalog produk UMKM secara real-time menggunakan REST API dari DummyJSON. Dilengkapi dengan fitur pencarian instan, sorting produk, ringkasan statistik, form pemesanan dengan validasi email, serta tombol coba lagi (retry) jika koneksi API gagal.

---

### Jawaban 10 Pertanyaan Penjelasan Kode

#### 1. Alur sejak halaman dibuka sampai data REST API tampil
Ketika halaman selesai dimuat (`DOMContentLoaded`), JavaScript menjalankan fungsi `fetchProductsData()`. Fungsi ini menampilkan indikator loading lalu memanggil data dari DummyJSON menggunakan `fetch()`. Saat data berhasil didapat dan statusnya valid (`response.ok`), data diubah ke format JSON lewat `response.json()` lalu disimpan ke array `allProducts`. Setelah itu, fungsi `processAndDisplayProducts()` dijalankan untuk memproses filter pencarian, pengurutan data, menghitung ringkasan statistik via `updateAnalytics()`, dan menampilkan kartu produk ke layar lewat `renderProducts()`.

#### 2. Mengapa setelah fetch() selesai masih perlu memeriksa response.ok?
Karena fungsi `fetch()` hanya akan gagal (masuk ke `catch`) jika terjadi kegagalan koneksi jaringan, seperti internet mati atau server tidak terjangkau. Jika server merespons dengan status error HTTP seperti 404 (Not Found) atau 500 (Internal Server Error), `fetch()` tetap dianggap berhasil dan tidak otomatis lari ke `catch`. Oleh sebab itu, kita wajib mengecek `if (!response.ok)` secara manual agar aplikasi bisa melempar error dan memunculkan tampilan error serta tombol retry ke pengguna.

#### 3. Bagaimana data JSON dari API diubah menjadi elemen DOM yang terlihat?
Pada fungsi `renderProducts()`, array data produk diulang menggunakan `forEach()`. Tiap produk dibuatkan elemen kartu `<article class="product-card">` menggunakan `document.createElement()`. Di dalamnya dibuat elemen gambar thumbnail, teks kategori, judul produk (`<h3>`), deskripsi (`<p>`), harga, dan rating. Nilai teks dimasukkan menggunakan properti `.textContent` agar aman dari injeksi script. Semua elemen anak digabungkan menggunakan `.appendChild()`, lalu kartu dimasukkan ke dalam elemen kontainer `#product-container`.

#### 4. Apa yang terjadi jika internet terputus, endpoint salah, atau server error (404/500)?
Jika internet mati, `fetch()` otomatis terputus dan langsung lari ke blok `catch`. Jika endpoint salah atau server error, pengecekan `!response.ok` akan melempar `Error` yang juga ditangkap oleh blok `catch`. Di dalam blok `catch`, indikator loading disembunyikan, teks error ditampilkan ke `#error-message`, dan kotak error `#error-box` dimunculkan lengkap dengan tombol Retry (`#btn-retry`) agar pengguna bisa mencoba memuat data kembali tanpa harus me-refresh halaman web.

#### 5. Cara kerja fitur Search real-time dan Sorting
Fitur ini dipusatkan di fungsi `processAndDisplayProducts()`. Untuk search, ada event listener `input` pada kolom cari (`#search-input`) yang menyaring data menggunakan metode `.filter()` berdasarkan judul, deskripsi, dan kategori produk. Untuk sorting, ada event listener `change` pada dropdown (`#sort-select`) yang mengurutkan data menggunakan metode `.sort()` berdasarkan harga terendah, harga tertinggi, nama A-Z, nama Z-A, atau rating. Hasil yang sudah disaring dan diurutkan langsung dirender kembali ke layar.

#### 6. Cara kerja validasi Form (Email dan Konfirmasi Email)
Saat tombol submit ditekan, fungsi `handleFormValidation()` memeriksa kelengkapan isian. Nama tidak boleh kosong, format email dicek menggunakan regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), dan konfirmasi email dicek apakah isinya sama persis dengan email utama. Jika salah atau kosong, pesan error teks ditampilkan di elemen `.field-error` dan input diberi kelas `.invalid` (border merah). Validasi ini penting agar data yang masuk valid, tidak ada kesalahan penulisan alamat email pembeli, dan mencegah data spam/fiktif masuk ke sistem.

#### 7. Skenario penerapan localStorage pada project
`localStorage` dapat diterapkan untuk menyimpan preferensi pengguna, misalnya menyimpan kata kunci pencarian terakhir (`searchKeyword`) atau mode pengurutan yang terakhir dipilih (`sortOption`). Dengan begitu, saat pengguna me-refresh halaman atau membuka kembali website di lain waktu, filter dan urutan produk yang mereka pilih sebelumnya tetap tersimpan dan tidak ter-reset ke awal.

#### 8. Fungsi penting (Maksimal 15 baris) & Input - Proses - Output
```javascript
function updateAnalytics(products) {
    if (!products.length) return;
    statTotal.textContent = products.length.toString();
    const totalSum = products.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = totalSum / products.length;
    statAvgPrice.textContent = avgPrice.toFixed(2);
    const maxProduct = products.reduce((prev, curr) => (curr.price > prev.price ? curr : prev), products[0]);
    statMaxPrice.textContent = `${maxProduct.title} ($${maxProduct.price})`;
    const categories = products.map(item => item.category);
    statCategoryCount.textContent = new Set(categories).size.toString();
}
```
* **Input :** Parameter array `products` yang sedang aktif ditampilkan.
* **Proses :** Menghitung total data, mencari rata-rata harga dengan `.reduce()`, mencari produk termahal dengan `.reduce()`, dan menghitung jumlah kategori unik dengan `.map()` serta `Set`.
* **Output :** Memperbarui angka statistik secara dinamis pada elemen `#stat-total`, `#stat-avg-price`, `#stat-max-price`, dan `#stat-category-count`.

#### 9. Bug/Error paling sulit selama pengerjaan dan solusinya
Bug paling menantang adalah ketika navigasi sidebar (`.site-nav`) bertabrakan dan menindih footer di bagian bawah saat halaman di-scroll. Penyebabnya adalah penggunaan `position: sticky` pada navigasi yang berada langsung di bawah `<body>` tanpa wrapper div, sehingga batas perlekatannya mencakup seluruh body sampai ke footer. Solusinya adalah menghapus `position: sticky` pada sidebar dan mengubahnya menjadi `height: fit-content`, serta memperjelas pemisahan baris CSS Grid dengan `grid-template-rows: auto 1fr auto` agar footer selalu terkunci aman di baris paling bawah.

#### 10. Dua perbaikan teknis jika diberi waktu tambahan satu minggu
1. **Penerapan Pagination / Infinite Scroll:** Membatasi pemuatan data awal dari API menggunakan query parameter `limit` dan `skip` agar data dimuat bertahap, sehingga performa rendering lebih ringan dan hemat kuota.
2. **Fitur Wishlist / Favorit:** Menambahkan tombol simpan produk favorit yang datanya disimpan ke `localStorage` agar pengguna bisa menandai produk UMKM yang ingin mereka beli nanti.

---

### AI Usage Log
| Tanggal | AI / Tool | Tujuan | Prompt / Ringkasan | Bagian Digunakan | Verifikasi / Modifikasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 16 Okt 2026 | Antigravity AI | Meminta saran kerapian struktur HTML | Meminta bantuan merapikan hierarki heading dan memeriksa elemen semantik agar bebas div-soup | Struktur dokumen di `umkm.html` | Menyesuaikan tag section, article, dan memastikan tidak ada div yang berlebihan secara mandiri. |
| 16 Okt 2026 | Antigravity AI | Konsultasi layout & diagnosis bug CSS | Menanyakan penyebab sidebar menimpa footer saat scroll dan cara membuat garis aksen kuning | Styling di `css/style.css` | Menerapkan grid rows, menghapus sticky yang menabrak footer, dan merapikan baris CSS sesuai kebutuhan sendiri. |
| 16 Okt 2026 | Antigravity AI | Konsultasi event reset form pada JS | Menanyakan cara membersihkan pesan error teks dan class invalid saat tombol reset diklik | Handler form di `js/app.js` | Menguji alur reset form, memeriksa kesesuaian validasi email, dan memastikan kode berjalan murni dengan Vanilla JS. |

