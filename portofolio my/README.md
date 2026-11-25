# Portofolio Pribadi - Labib Abdul Fattah 🚀

Website portofolio interaktif dengan **Layar Pembuka (Intro / Landing Screen)** sesuai desain mockup yang telah dibuat, dilengkapi tombol **Next ➔** untuk menuju ke **Halaman Beranda Utama**.

---

## 📁 Struktur Berkas

```
portofolio my/
├── assets/
│   ├── background.jpg         # Gambar latar belakang kuas cat air biru
│   ├── profile.jpg            # Foto profil Labib Abdul Fattah
│   └── mockup-reference.jpg   # Referensi desain mockup awal
├── index.html                 # Halaman utama (Intro Landing Screen + Beranda interaktif)
├── beranda.html               # Halaman Beranda versi mandiri (opsional)
├── style.css                  # Pengaturan gaya tampilan (CSS & Desain Responsif)
├── script.js                  # Transisi tombol Next, navigasi, dan animasi
└── README.md                  # Panduan penggunaan & kustomisasi
```

---

## ✨ Fitur-Fitur Utama

1. **Layar Pembuka (Landing Screen Mockup)**:
   - Menampilkan foto profil bulat dengan frame aksen titik-titik.
   - Kotak nama **Labib Abdul Fattah** dengan font serif elegan dan gradasi warna biru-cyan.
   - Tombol **Next ➔** dengan lingkaran panah hitam beranimasi & efek denyut (ripple).
   - Tanda tangan/watermark *"developer by Labib"* di sudut kanan bawah.
   - Begitu tombol **Next ➔** diklik, halaman akan bertransisi mulus ke Beranda!

2. **Halaman Beranda (Beranda Screen)**:
   - **Navbar sticky**: Logo, menu navigasi, dan tombol *"Layar Awal"* untuk melihat kembali layar intro kapan saja.
   - **Hero Section**: Sapaan ramah, status *"Open for collaboration"*, ringkasan keahlian, dan tombol aksi.
   - **Tentang Saya**: Penjelasan singkat tentang ketertarikan Labib di dunia web development.
   - **Keahlian (Skills)**: Kartu kemampuan (HTML5, CSS3, JavaScript, UI/UX, Git, Responsivitas).
   - **Proyek Portofolio**: Kartu etalase karya siap pakai yang bisa kamu tambahkan foto & link.
   - **Kontak**: Formulir pesan langsung serta info kontak (WhatsApp, Email, Lokasi).
   - **Footer**: Hak cipta & tombol kembali ke atas.

---

## 🎨 Cara Menyesuaikan Desain ("Desain Aku yang Nentuin")

Kamu bisa dengan sangat mudah mengubah warna, ukuran, atau susunan desain:

### 1. Mengubah Warna & Tema (`style.css`):
Buka `style.css`, di bagian paling atas terdapat `:root`:
```css
:root {
  --primary: #4f46e5;       /* Warna utama (tombol, link, highlight) */
  --secondary: #06b6d4;     /* Warna aksen cyan */
  --text-dark: #0f172a;     /* Warna teks judul */
  /* Ganti kode hex warna sesuai selera kamu */
}
```

### 2. Mengubah Teks & Konten (`index.html`):
- Buka `index.html` di VS Code / teks editor favoritmu.
- Setiap bagian sudah diberi komentar penjelas yang jelas, misalnya `<!-- Hero Section -->`, `<!-- Proyek Portofolio -->`, dll.
- Kamu tinggal ganti teks, judul proyek, atau link media sosialmu (GitHub, Instagram, LinkedIn).

### 3. Menjalankan Website:
- Cukup **klik ganda (double-click)** pada berkas `index.html` di File Explorer, dan website akan langsung terbuka di Google Chrome / Microsoft Edge!

