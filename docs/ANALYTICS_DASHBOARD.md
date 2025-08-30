# Analitik dan Dashboard

Projek ini sekarang telah diperbarui dengan fitur analitik dan dashboard yang komprehensif untuk memantau dan menganalisis penggunaan perpustakaan digital. Fitur ini memberikan wawasan tentang berbagai aspek penggunaan sistem, termasuk statistik peminjaman, buku populer, metrik keterlibatan pengguna, dan banyak lagi.

## Fitur Analitik yang Tersedia

### 1. Statistik Peminjaman
Endpoint: `GET /api/admin/analytics/loans`

Parameter query:
- `startDate`: Filter data dari tanggal tertentu (format: YYYY-MM-DD)
- `endDate`: Filter data sampai tanggal tertentu (format: YYYY-MM-DD)
- `categoryId`: Filter data berdasarkan kategori buku tertentu

Contoh respons:
```json
{
  "success": true,
  "message": "Loan statistics retrieved successfully",
  "data": {
    "totalLoans": 120,
    "statusDistribution": {
      "BORROWED": 45,
      "RETURNED": 68,
      "OVERDUE": 5,
      "LOST": 2
    },
    "avgLoanDuration": 14,
    "roleDistribution": {
      "USER": 95,
      "LIBRARIAN": 15,
      "ADMIN": 10
    },
    "categoryDistribution": {
      "Fiction": 45,
      "Science": 30,
      "History": 25,
      "Biography": 20
    }
  }
}
```

### 2. Metrik Keterlibatan Pengguna
Endpoint: `GET /api/admin/analytics/users/engagement`

Parameter query:
- `startDate`: Filter data dari tanggal tertentu (format: YYYY-MM-DD)
- `endDate`: Filter data sampai tanggal tertentu (format: YYYY-MM-DD)
- `minActivityCount`: Filter pengguna dengan jumlah aktivitas minimum

Contoh respons:
```json
{
  "success": true,
  "message": "User engagement data retrieved successfully",
  "data": {
    "totalUsers": 250,
    "activeUsers": 180,
    "engagementRate": 72.0,
    "activityDistribution": {
      "loans": 320,
      "reviews": 145,
      "lists": 98
    },
    "roleDistribution": {
      "USER": 160,
      "LIBRARIAN": 15,
      "ADMIN": 5
    },
    "topUsers": [
      {
        "id": "user-123",
        "username": "bookworm42",
        "name": "John Smith",
        "role": "USER",
        "totalActivity": 28,
        "loanCount": 15,
        "reviewCount": 8,
        "listCount": 5,
        "avgRating": 4.2
      },
      // ...lebih banyak pengguna
    ]
  }
}
```

### 3. Metrik Popularitas Buku
Endpoint: `GET /api/admin/analytics/books/popularity`

Parameter query:
- `startDate`: Filter data dari tanggal tertentu (format: YYYY-MM-DD)
- `endDate`: Filter data sampai tanggal tertentu (format: YYYY-MM-DD)
- `limit`: Batasi jumlah buku yang dikembalikan (default: 10)
- `includeDetails`: Sertakan detail buku lengkap (default: true)

Contoh respons:
```json
{
  "success": true,
  "message": "Book popularity metrics retrieved successfully",
  "data": [
    {
      "id": "book-123",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "category": "Fiction",
      "coverImage": "/uploads/covers/mockingbird.jpg",
      "metrics": {
        "loanCount": 42,
        "reviewCount": 28,
        "wishlistAdds": 15,
        "readingListAdds": 10,
        "totalActivity": 95,
        "avgRating": 4.8,
        "popularityScore": 29.5
      }
    },
    // ...lebih banyak buku
  ]
}
```

### 4. Data Dashboard
Endpoint: `GET /api/admin/analytics/dashboard`

Memberikan semua data yang diperlukan untuk dashboard admin, termasuk:
- Statistik cepat (total pengguna, buku, peminjaman, dll.)
- Peminjaman terbaru
- Pengguna baru
- Buku dengan peringkat tertinggi
- Statistik bulanan

Contoh respons:
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "quickStats": {
      "totalUsers": 250,
      "totalBooks": 1500,
      "totalLoans": 3200,
      "activeLoans": 145,
      "overdueLoans": 12,
      "totalReviews": 850,
      "overdueRate": 0.4
    },
    "recentLoans": [
      {
        "id": "loan-123",
        "bookTitle": "1984",
        "bookAuthor": "George Orwell",
        "coverImage": "/uploads/covers/1984.jpg",
        "username": "reader55",
        "userName": "Alice Johnson",
        "loanDate": "2023-10-15T10:30:00Z",
        "dueDate": "2023-10-29T10:30:00Z",
        "status": "BORROWED"
      },
      // ...lebih banyak peminjaman
    ],
    "recentUsers": [
      {
        "id": "user-456",
        "username": "booklover99",
        "name": "David Brown",
        "role": "USER",
        "joinedDate": "2023-10-12T15:20:00Z"
      },
      // ...lebih banyak pengguna
    ],
    "topRatedBooks": [
      {
        "id": "book-789",
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "coverImage": "/uploads/covers/pride.jpg",
        "avgRating": 4.9,
        "reviewCount": 45
      },
      // ...lebih banyak buku
    ],
    "monthlyStats": [
      {
        "month": "2023-10-01T00:00:00Z",
        "count": 210
      },
      // ...lebih banyak bulan
    ]
  }
}
```

## Penggunaan

1. **Akses Dashboard**: Fitur analitik dan dashboard hanya tersedia untuk pengguna dengan peran ADMIN.

2. **Filtering Data**: Sebagian besar endpoint mendukung filtering berdasarkan rentang tanggal, yang memungkinkan Anda untuk menganalisis data dalam periode tertentu.

3. **Integrasi Frontend**: Data yang dikembalikan oleh endpoint ini dirancang untuk digunakan dengan mudah oleh komponen visualisasi frontend seperti grafik, diagram, dan tabel.

4. **Ekspor Data**: Untuk analisis lebih lanjut, data dapat diunduh dalam format CSV menggunakan endpoint ekspor yang ada.

## Tips Implementasi Frontend

Untuk mengimplementasikan dashboard frontend yang efektif, pertimbangkan langkah-langkah berikut:

1. Gunakan pustaka visualisasi data seperti Chart.js, D3.js, atau Recharts untuk membuat grafik dan diagram.

2. Implementasikan pemilih rentang tanggal untuk memungkinkan pengguna memfilter data.

3. Buat tampilan dashboard dengan kartu metrik, grafik tren, dan tabel data.

4. Tambahkan fitur ekspor untuk memungkinkan admin mengunduh data untuk analisis offline.

5. Implementasikan pemberitahuan untuk kondisi penting, seperti lonjakan peminjaman yang terlambat.
