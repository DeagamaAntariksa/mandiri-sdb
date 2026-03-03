# 🚀 Panduan Deployment "Autopilot" (Aiven & Render)

Ikuti langkah-langkah di bawah ini untuk memindahkan website Anda dari lokal (XAMPP) ke internet (Cloud).

---

## 1. Setup Database (Aiven MySQL) - GRATIS
1.  Daftar di [Aiven.io](https://aiven.io/).
2.  Buat layanan baru: **MySQL**.
3.  Pilih cloud provider (e.g., Google Cloud atau AWS) dan region terdekat (misal: Singapore).
4.  Pilih **Free Plan**.
5.  Setelah layanan aktif, cari menu **Connection Details**:
    *   Catat: **Host**, **Port**, **User**, dan **Password**.
6.  Buka tab **Query Editor** atau gunakan tools seperti DBeaver/HeidiSQL.
7.  Copy isi file [render-init.sql](file:///e:/xampp/htdocs/web/api-backend/render-init.sql) dan jalankan (Execute) di database Aiven tersebut.
    > Database Anda sekarang sudah siap dengan tabel-tabel yang diperlukan!

---

## 2. Setup Backend (Render) - GRATIS
1.  Daftar di [Render.com](https://render.com/) menggunakan akun GitHub Anda.
2.  Klik **New +** > **Web Service**.
3.  Pilih repositori GitHub Anda (`mandiri-sdb`).
4.  Gunakan pengaturan berikut:
    *   **Name**: `mandiri-sdb-backend` (bebas).
    *   **Root Directory**: `api-backend`.
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
5.  Klik tombol **Advanced** > **Add Environment Variable** dan masukkan data dari Aiven:
    *   `DB_HOST`: (Host dari Aiven)
    *   `DB_USER`: (User dari Aiven)
    *   `DB_PASSWORD`: (Password dari Aiven)
    *   `DB_NAME`: `defaultdb` (atau nama db Anda di Aiven)
    *   `DB_PORT`: (Port dari Aiven)
    *   `DB_SSL`: `true`
    *   `NODE_ENV`: `production`
    *   `BASE_URL`: (URL web service Render Anda, contoh: `https://mandiri-sdb-backend.onrender.com`)
    *   `EMAIL_USER`: `mandirireminderkcpi@gmail.com`
    *   `EMAIL_PASS`: `rlcz xcmh xpup xeew`
6.  Klik **Create Web Service**.

---

## 3. Setup Frontend (Vercel) - GRATIS
(Ulangi langkah ini untuk `admin-web` dan `customer-web`)
1.  Daftar di [Vercel.com](https://vercel.com/) pakai GitHub.
2.  **Add New Project** > Pilih repositori `mandiri-sdb`.
3.  **Edit Settings**:
    *   **Project Name**: `mandiri-sdb-admin` atau `mandiri-sdb-customer`.
    *   **Root Directory**: Pilih folder `admin-web` atau `customer-web`.
    *   **Framework Preset**: `Vite`.
4.  **Environment Variables**:
    *   Tambahkan `VITE_API_URL` dengan nilai URL Backend Render Anda tadi (e.g., `https://mandiri-sdb-backend.onrender.com`).
5.  Klik **Deploy**.

---

### Selesai! 🎉
Website Anda sekarang online. 

> [!IMPORTANT]
> Karena Render paket gratis akan "tidur" jika tidak ada akses, saat pertama kali dibuka setelah lama tidak diakses, website mungkin butuh waktu sekitar 30 detik untuk loading.

Jika ada kendala saat memasukkan data, silakan beritahu saya!
