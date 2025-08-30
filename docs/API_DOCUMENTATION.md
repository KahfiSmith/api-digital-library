# Dokumentasi API Digital Library

API Digital Library telah dilengkapi dengan dokumentasi interaktif berbasis OpenAPI/Swagger. Dokumentasi ini memungkinkan Anda untuk:

1. Menjelajahi semua endpoint API yang tersedia
2. Melihat parameter yang diperlukan untuk setiap endpoint
3. Mencoba endpoint secara langsung dari browser
4. Melihat skema respons yang diharapkan

## Cara Mengakses API Documentation

Setelah menjalankan aplikasi, Anda dapat mengakses dokumentasi API melalui beberapa cara:

### 1. Swagger UI (Direkomendasikan)

URL: [http://localhost:3001/api/v1/swagger](http://localhost:3001/api/v1/swagger)

Swagger UI menyediakan antarmuka yang interaktif dan user-friendly untuk menjelajahi API. Fitur-fitur utama:

- Pengelompokan endpoint berdasarkan tag
- Try-it-out untuk menguji endpoint langsung dari browser
- Dukungan untuk autentikasi dengan token JWT
- Dokumentasi skema request dan response

### 2. HTML Docs

URL: [http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)

Versi alternatif dari dokumentasi Swagger yang lebih ringan.

### 3. OpenAPI JSON

URL: [http://localhost:3001/api/v1/openapi.json](http://localhost:3001/api/v1/openapi.json)

File OpenAPI Specification dalam format JSON. Ini berguna jika Anda ingin mengimpor spesifikasi API ke dalam tools lain seperti Postman atau generator kode klien.

## Autentikasi dalam Dokumentasi

Untuk menguji endpoint yang memerlukan autentikasi:

1. Pertama, gunakan endpoint `/api/v1/auth/login` untuk mendapatkan token
2. Klik tombol "Authorize" di bagian atas halaman Swagger UI
3. Masukkan token dalam format: `Bearer your_token_here`
4. Klik "Authorize"

Setelah melakukan langkah-langkah di atas, Anda akan dapat menguji endpoint yang memerlukan autentikasi.

## Menggunakan API Docs sebagai Referensi

Dokumentasi API ini dapat digunakan sebagai referensi utama saat mengembangkan frontend atau layanan lain yang berinteraksi dengan Digital Library API. Setiap endpoint dilengkapi dengan:

- Deskripsi singkat tentang fungsinya
- Parameter yang diperlukan (path, query, body)
- Format request yang diharapkan
- Format response yang akan dikembalikan
- Kode status HTTP yang mungkin dikembalikan

## Tips Penggunaan

- Gunakan fitur "Try it out" untuk menguji API secara langsung
- Perhatikan skema request untuk memahami data apa yang diharapkan API
- Untuk endpoint yang memerlukan file upload, Anda perlu menggunakan tools seperti Postman atau curl

## Pembaruan Dokumentasi

Dokumentasi API akan otomatis diperbarui saat ada perubahan pada kode API. Spesifikasi OpenAPI dikelola dalam file `src/docs/openapi.ts`.

Jika Anda menemukan kesalahan atau kekurangan dalam dokumentasi, silakan laporkan atau ajukan perbaikan melalui pull request ke repositori proyek.
