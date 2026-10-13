import type { PortableTextBlock } from "@portabletext/react";
import type {
  Article,
  FaqItem,
  LandingContent,
  Product,
  Testimonial,
} from "@/lib/types";

/**
 * Typed JSON fixtures: the zero-config content source for local development
 * and the source of truth for the Sanity seed dataset (see
 * scripts/generate-seed.mjs). Same shapes as the CMS documents map to.
 */

/* ----------------------------- portable text ------------------------------ */

function block(
  style: string,
  text: string,
  level?: number,
): PortableTextBlock {
  return {
    _type: "block",
    _key: crypto.randomUUID(),
    style,
    ...(level ? { level } : {}),
    markDefs: [],
    children: [
      { _type: "span", _key: crypto.randomUUID(), text, marks: [] },
    ],
  };
}

const p = (text: string) => block("normal", text);
const h2 = (text: string) => block("h2", text);
const li = (text: string) => block("normal", text, 1);

/* -------------------------------- products -------------------------------- */

function packages(
  basic: number,
  pro: number,
  business: number,
  regular: { basic?: number; pro?: number; business?: number } = {},
): Product["packages"] {
  const make = (
    id: Product["packages"][number]["id"],
    name: string,
    monthlyPrice: number,
    regularMonthlyPrice: number | undefined,
    highlights: string[],
  ) => ({
    id,
    name,
    monthlyPrice,
    regularMonthlyPrice: regularMonthlyPrice ?? null,
    highlights,
  });
  return [
    make(
      "basic",
      "Basic",
      basic,
      regular.basic,
      ["Fitur inti lengkap", "1 lokasi", "Dukungan email"],
    ),
    make(
      "pro",
      "Pro",
      pro,
      regular.pro,
      ["Semua fitur Basic", "Multi-lokasi", "Dukungan prioritas"],
    ),
    make(
      "business",
      "Business",
      business,
      regular.business,
      ["Semua fitur Pro", "API & integrasi", "Account manager"],
    ),
  ];
}

export const products: Product[] = [
  {
    id: "pos",
    slug: "kodeva-pos",
    name: "Kodeva POS",
    category: "pos",
    unit: "outlet",
    tagline: "Kasir cepat untuk outlet sibuk",
    description:
      "Point of sale untuk F&B dan retail: transaksi cepat, pembayaran QRIS & kartu, dan sinkronisasi real-time antar perangkat. Berjalan di tablet maupun komputer kasir.",
    features: [
      "Mode offline — transaksi tetap jalan tanpa internet",
      "Pembayaran QRIS, kartu, dan tunai dalam satu layar",
      "Manajemen shift dan tutup kasir harian",
      "Sinkronisasi menu & harga real-time",
    ],
    images: [
      {
        url: "/images/products/kodeva-pos-a.svg",
        alt: "Tampilan layar kasir Kodeva POS",
      },
      {
        url: "/images/products/kodeva-pos-b.svg",
        alt: "Dashboard penjualan Kodeva POS",
      },
    ],
    promoQuotaRemaining: 40,
    promoQuotaTotal: 120,
    badge: "Terlaris",
    packages: packages(149_000, 249_000, 399_000, {
      basic: 199_000,
      pro: 329_000,
      business: 499_000,
    }),
  },
  {
    id: "kiosk",
    slug: "kodeva-kiosk",
    name: "Kodeva Kiosk",
    category: "pos",
    unit: "outlet",
    tagline: "Pesan mandiri tanpa antre",
    description:
      "Kios pemesanan mandiri yang mengurangi antrean di jam sibuk. Pelanggan memesan dan membayar sendiri; pesanan masuk langsung ke dapur.",
    features: [
      "Upsell otomatis di layar pembayaran",
      "Terhubung langsung ke Kodeva POS",
      "Mendukung bahasa Indonesia dan Inggris",
      "Mode layar sentuh besar untuk queuing",
    ],
    images: [
      {
        url: "/images/products/kodeva-kiosk-a.svg",
        alt: "Layar kios pemesanan mandiri Kodeva Kiosk",
      },
      {
        url: "/images/products/kodeva-kiosk-b.svg",
        alt: "Dashboard antrean pesanan Kodeva Kiosk",
      },
    ],
    promoQuotaRemaining: 25,
    promoQuotaTotal: 80,
    packages: packages(129_000, 199_000, 329_000, {
      basic: 169_000,
      pro: 259_000,
    }),
  },
  {
    id: "hr",
    slug: "kodeva-hr",
    name: "Kodeva HR",
    category: "hr-payroll",
    unit: "user",
    tagline: "Data karyawan rapi, cuti tanpa drama",
    description:
      "Kelola data karyawan, cuti, dan absensi dalam satu tempat. Persetujuan berjenjang dan notifikasi otomatis mengurangi chat HR yang menumpuk.",
    features: [
      "Pengajuan cuti & izin dengan persetujuan berjenjang",
      "Absensi dengan geofence opsional",
      "Organigram dan dokumen karyawan terpusat",
      "Ekspor laporan siap audit",
    ],
    images: [
      {
        url: "/images/products/kodeva-hr-a.svg",
        alt: "Beranda modul HR Kodeva",
      },
      {
        url: "/images/products/kodeva-hr-b.svg",
        alt: "Kalender cuti tim Kodeva HR",
      },
    ],
    promoQuotaRemaining: 60,
    promoQuotaTotal: 150,
    packages: packages(99_000, 169_000, 279_000, { basic: 129_000 }),
  },
  {
    id: "payroll",
    slug: "kodeva-payroll",
    name: "Kodeva Payroll",
    category: "hr-payroll",
    unit: "user",
    tagline: "Payroll tepat waktu, slip otomatis",
    description:
      "Hitung gaji, tunjangan, potongan, dan PPh 21 otomatis. Slip gaji terkirim ke setiap karyawan tanpa scroll spreadsheet.",
    features: [
      "Perhitungan PPh 21 otomatis (TER & progresif)",
      "Slip gaji digital via email dan aplikasi",
      "Integrasi absensi & lembur dari Kodeva HR",
      "Jurnal akuntansi siap unggah",
    ],
    images: [
      {
        url: "/images/products/kodeva-payroll-a.svg",
        alt: "Ringkasan payroll bulanan Kodeva Payroll",
      },
      {
        url: "/images/products/kodeva-payroll-b.svg",
        alt: "Contoh slip gaji digital Kodeva Payroll",
      },
    ],
    promoQuotaRemaining: 45,
    promoQuotaTotal: 120,
    badge: "Favorit HR",
    packages: packages(119_000, 199_000, 319_000, {
      basic: 149_000,
      pro: 249_000,
    }),
  },
  {
    id: "inventory",
    slug: "kodeva-inventory",
    name: "Kodeva Inventory",
    category: "addons",
    unit: "outlet",
    tagline: "Stok akurat lintas gudang",
    description:
      "Pantau stok multi-gudang dan multi-outlet dengan kartu stok lengkap, transfer antar gudang, dan peringatan stok minimum.",
    features: [
      "Kartu stok dan penyesuaian tercatat rapi",
      "Transfer stok antar gudang dengan approval",
      "Peringatan stok minimum otomatis",
      "Impor stok awal dari spreadsheet",
    ],
    images: [
      {
        url: "/images/products/kodeva-inventory-a.svg",
        alt: "Daftar stok Kodeva Inventory",
      },
      {
        url: "/images/products/kodeva-inventory-b.svg",
        alt: "Grafik pergerakan stok Kodeva Inventory",
      },
    ],
    promoQuotaRemaining: 50,
    promoQuotaTotal: 100,
    packages: packages(89_000, 149_000, 239_000),
  },
  {
    id: "loyalty",
    slug: "kodeva-loyalty",
    name: "Kodeva Loyalty",
    category: "addons",
    unit: "outlet",
    tagline: "Pelanggan balik lagi lewat poin",
    description:
      "Program poin dan membership yang terhubung langsung ke kasir. Segmentasi pelanggan dan voucher membuat promo lebih tepat sasaran.",
    features: [
      "Poin otomatis saat transaksi di kasir",
      "Voucher dan promo khusus member",
      "Segmentasi pelanggan berdasarkan kunjungan",
      "Halaman member siap bagi ke pelanggan",
    ],
    images: [
      {
        url: "/images/products/kodeva-loyalty-a.svg",
        alt: "Halaman membership Kodeva Loyalty",
      },
      {
        url: "/images/products/kodeva-loyalty-b.svg",
        alt: "Panel voucher Kodeva Loyalty",
      },
    ],
    promoQuotaRemaining: 15,
    promoQuotaTotal: 60,
    packages: packages(79_000, 129_000, 219_000, {
      business: 279_000,
    }),
  },
  {
    id: "reports",
    slug: "kodeva-reports",
    name: "Kodeva Reports",
    category: "addons",
    unit: "user",
    tagline: "Satu dashboard untuk semua cabang",
    description:
      "Konsolidasikan penjualan, stok, dan SDM dari semua produk Kodeva ke dalam satu dashboard eksekutif, lengkap dengan laporan terjadwal.",
    features: [
      "Dashboard konsolidasi lintas produk",
      "Laporan harian/mingguan otomatis via email",
      "Ekspor Excel dan CSV",
      "Perbandingan antar outlet",
    ],
    images: [
      {
        url: "/images/products/kodeva-reports-a.svg",
        alt: "Dashboard eksekutif Kodeva Reports",
      },
      {
        url: "/images/products/kodeva-reports-b.svg",
        alt: "Laporan perbandingan outlet Kodeva Reports",
      },
    ],
    promoQuotaRemaining: 30,
    promoQuotaTotal: 90,
    packages: packages(69_000, 119_000, 199_000),
  },
];

/* --------------------------------- landing --------------------------------- */

export const hero: LandingContent["hero"] = {
  eyebrow: "Promo Akhir Tahun — kuota lisensi terbatas",
  title: "Software bisnis yang bikin operasional enteng",
  subtitle:
    "POS, HR, dan payroll berlangganan untuk bisnis kecil dan menegah. Pilih paket, aktifkan hari ini, dan tutup buku tahun ini dengan rapi.",
  image: { url: "/images/hero.svg", alt: "Ilustrasi produk Kodeva" },
  ctaLabel: "Lihat Katalog Produk",
  ctaHref: "/products",
};

export const featuredProductIds = ["pos", "payroll", "hr", "inventory"];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Tiga outlet kami sekarang pakai Kodeva POS. Tutup kasir yang dulu 40 menit jadi 5 menit, dan laporan masuk otomatis tiap pagi.",
    author: "Rina Pratiwi",
    role: "Owner",
    company: "Kopi Nusantara",
  },
  {
    quote:
      "Payroll 60 karyawan selesai dalam satu sore. Slip gaji langsung masuk email karyawan tanpa kami sibuk merge spreadsheet.",
    author: "Bayu Setiawan",
    role: "HR Manager",
    company: "Gudang Seragam ID",
  },
  {
    quote:
      "Kiosk self-service-nya mengurangi antrean jam makan siang hampir separuh. Staf bisa fokus packing dan ramah ke pelanggan.",
    author: "Alya Rachman",
    role: "Operations Lead",
    company: "Ayam Bakar Cak Min",
  },
  {
    quote:
      "Kuota promo paket Business bikin kami berani coba modul Inventory. Stok antar gudang sekarang tidak pernah selisih lagi.",
    author: "Hendra Wijaya",
    role: "Direktur",
    company: "Toko Bangunan Sinar",
  },
];

export const faq: FaqItem[] = [
  {
    question: "Apa itu kuota lisensi promo?",
    answer:
      "Setiap produk punya jumlah lisensi harga promo yang terbatas. Kuota dihitung dari total lisensi per produk di keranjang, apa pun paketnya (Basic, Pro, atau Business). Jika kuota habis, harga kembali normal.",
  },
  {
    question: "Apakah ini langganan atau beli sekali?",
    answer:
      "Semua produk Kodeva berbasis langganan bulanan per lisensi. Kamu bisa menambah atau mengurangi jumlah lisensi kapan saja dari dashboard.",
  },
  {
    question: "Bagaimana cara pembayarannya?",
    answer:
      "Untuk demo ini, pembayaran disimulasikan di halaman checkout tanpa gateway sungguhan. Pada implementasi produksi, pembayaran terintegrasi dengan payment gateway lokal.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Data dienkripsi saat transit dan disimpan sesuai standar keamanan industri. Untuk keperluan demo, semua data yang kamu masukkan adalah data dummy.",
  },
  {
    question: "Bisa pindah paket di tengah jalan?",
    answer:
      "Bisa. Upgrade paket berlaku siklus berikutnya dan selisihnya dihitung otomatis. Downgrade berlaku setelah periode berjalan selesai.",
  },
  {
    question: "Apakah ada dukungan migrasi data?",
    answer:
      "Tim onboarding kami membantu migrasi data produk dan karyawan dari spreadsheet untuk paket Pro dan Business.",
  },
];

/* --------------------------------- articles -------------------------------- */

export const articles: Article[] = [
  {
    title: "5 Kesalahan Kasir yang Diam-diam Merugikan Omzet",
    slug: "kesalahan-kasir-merugikan-omzet",
    category: "Tips",
    excerpt:
      "Dari shift yang tidak ditutup sampai diskon manual — lima kebiasaan kecil di kasir yang membuat laporanmu tidak pernah cocok.",
    coverImage: {
      url: "/images/blog/pos-rookie-mistakes.svg",
      alt: "Ilustrasi kasir sedang melayani pelanggan",
    },
    publishedAt: "2026-11-18T09:00:00.000Z",
    published: true,
    relatedProductIds: ["pos", "reports"],
    body: [
      p(
        "Kasir adalah pintu terakhir setiap rupiah masuk. Sayangnya, beberapa kebiasaan kecil di balik mesin kasir justru membuat omzet bocor tanpa terlihat di laporan harian.",
      ),
      h2("1. Shift tidak ditutup setiap hari"),
      p(
        "Selisih kas yang dibiarkan menggulung ke hari berikutnya membuat audit jadi tebak-tebakan. Pastikan setiap shift ditutup dengan hitung kas dan selisih dicatat.",
      ),
      h2("2. Diskon manual di akhir transaksi"),
      p(
        "Diskon yang diketik bebas tanpa batasan membuat margin tidak bisa dianalisis. Gunakan promo terstruktur sehingga setiap diskon punya alasan dan batas.",
      ),
      h2("3. Void tanpa alasan"),
      p(
        "Transaksi yang di-void tanpa catatan adalah celah klasik. Aktifkan wajib alasan dan approval untuk setiap void.",
      ),
      h2("4. Harga tidak disinkronkan"),
      p(
        "Menu atau produk yang harganya diubah di satu perangkat saja membuat transaksi lintas kasir tidak konsisten. Gunakan sinkronisasi real-time.",
      ),
      h2("5. Laporan hanya dilihat saat ada masalah"),
      p(
        "Dashboard harian yang dibaca rutin membantu kamu melihat pola aneh sebelum jadi kerugian besar.",
      ),
    ],
  },
  {
    title: "Checklist Payroll Akhir Tahun: THR, PPh 21, dan Jurnal",
    slug: "checklist-payroll-akhir-tahun",
    category: "Panduan",
    excerpt:
      "Tutup buku tahunan tanpa drama dengan checklist payroll: rekonsiliasi absensi, hitung THR, dan siapkan jurnal untuk akuntan.",
    coverImage: {
      url: "/images/blog/payroll-year-end.svg",
      alt: "Ilustrasi kalender akhir tahun dan dokumen payroll",
    },
    publishedAt: "2026-11-28T09:00:00.000Z",
    published: true,
    relatedProductIds: ["payroll", "hr"],
    body: [
      p(
        "Akhir tahun adalah puncak kesibukan tim HR dan payroll: absensi direkonsiliasi, THR dihitung, dan semua harus terekap sebelum libur.",
      ),
      h2("Rekonsiliasi absensi dan lembur"),
      p(
        "Pastikan seluruh data absensi sudah approved sebelum cutoff payroll. Data yang terlambat disetujui adalah penyebab utama slip gaji ditarik ulang.",
      ),
      h2("Hitung THR dengan tarif yang benar"),
      p(
        "Pahami komponen gaji yang masuk perhitungan THR. Sistem payroll yang baik memisahkan komponen tetap dan tidak tetap secara otomatis.",
      ),
      h2("PPh 21: TER atau progresif?"),
      p(
        "Metode efektif rata-rata (TER) mempermudah pembulatan bulanan, namun ada kondisi karyawan baru dan resign yang tetap pakai metode progresif. Pastikan sistemmu menangani keduanya.",
      ),
      h2("Siapkan jurnal untuk akuntan"),
      p(
        "Ekspor jurnal beban gaji dalam format yang akuntanmu kenal. Ini menghemat satu-dua hari kerja revisi di Januari.",
      ),
    ],
  },
  {
    title: "Studi Kasus: Dari Satu Kasir ke Tiga Kanal Jualan",
    slug: "studi-kasus-tiga-kanal-jualan",
    category: "Studi Kasus",
    excerpt:
      "Bagaimana jaringan kopi di Bandung menggabungkan dine-in, kios mandiri, dan loyalty program tanpa menambah staf kasir.",
    coverImage: {
      url: "/images/blog/omni-channel.svg",
      alt: "Ilustrasi tiga kanal penjualan kafe",
    },
    publishedAt: "2026-12-02T09:00:00.000Z",
    published: true,
    relatedProductIds: ["pos", "kiosk", "loyalty"],
    body: [
      p(
        "Kopi Nusantara mulai dari satu kasir dan satu antrian panjang. Saat membuka outlet kedua dan ketiga, antrean justru menjadi bumerang.",
      ),
      h2("Tantangan: antrean jam sibuk"),
      p(
        "Pada jam makan siang, rata-rata pelanggan menunggu 12 menit. Sebagian membatalkan pesanan sebelum sampai kasir.",
      ),
      h2("Solusi: kios mandiri + loyalty"),
      p(
        "Dua kios mandiri menangani pesanan sederhana, sementara program poin membuat pelanggan kembali dan memesan lewat halaman member.",
      ),
      h2("Hasil setelah tiga bulan"),
      p(
        "Waktu tunggu turun 48%, transaksi per jam naik 23%, dan 35% transaksi kini datang dari member yang kembali.",
      ),
    ],
  },
  {
    title: "Cara Kerja Kuota Lisensi Promo Akhir Tahun",
    slug: "cara-kerja-kuota-lisensi-promo",
    category: "Promo",
    excerpt:
      "Kuota promo dihitung per produk, bukan per paket. Begini cara kerjanya supaya kamu tidak kaget saat checkout.",
    coverImage: {
      url: "/images/blog/promo-quota-guide.svg",
      alt: "Ilustrasi kuota lisensi promo yang terbatas",
    },
    publishedAt: "2026-12-05T09:00:00.000Z",
    published: true,
    relatedProductIds: ["pos", "payroll"],
    body: [
      p(
        "Selama Promo Akhir Tahun, setiap produk punya jumlah lisensi harga promo yang terbatas. Kuota ini berlaku untuk total lisensi satu produk di keranjangmu.",
      ),
      h2("Contoh perhitungan"),
      p(
        "Jika kamu mengambil 10 lisensi Kodeva POS paket Basic dan 5 lisensi paket Pro, total 15 lisensi POS dihitung dari kuota yang sama.",
      ),
      h2("Kenapa kuota digabung antar paket?"),
      p(
        "Kuota adalah anggaran promo per produk, bukan per paket. Dengan menggabungkannya, promo tetap adil untuk semua calon pelanggan.",
      ),
      h2("Apa yang terjadi saat kuota habis?"),
      p(
        "Lisensi berikutnya kembali ke harga normal. Keranjangmu akan menampilkan peringatan sebelum kamu checkout, bukan setelahnya.",
      ),
    ],
  },
  {
    title: "Onboarding Karyawan Baru dalam 30 Menit",
    slug: "onboarding-karyawan-30-menit",
    category: "Tips",
    excerpt:
      "Template onboarding HR: dokumen yang diminta, akses yang diberikan, dan jadwal minggu pertama yang jelas.",
    coverImage: {
      url: "/images/blog/hr-onboarding.svg",
      alt: "Ilustrasi tim HR menyambut karyawan baru",
    },
    publishedAt: "2026-12-08T09:00:00.000Z",
    published: true,
    relatedProductIds: ["hr"],
    body: [
      p(
        "Onboarding yang rapi di minggu pertama menentukan retensi jangka panjang. Kabar baiknya: prosesnya bisa distandarkan.",
      ),
      h2("H-1: siapkan dokumen dan akses"),
      p(
        "Kirim daftar dokumen (KTP, NPWP, rekening) dan siapkan akun email serta akses aplikasi sebelum hari pertama.",
      ),
      h2("Hari pertama: satu kontak, satu jadwal"),
      p(
        "Berikan satu buddy dan jadwal minggu pertama yang tercetak. Kejelasan mengurangi kecemasan karyawan baru.",
      ),
      h2("Hari ketujuh: cek-in pertama"),
      p(
        "Ajak bicara santai 15 menit: apa yang membingungkan, apa yang menyenangkan. Catat untuk perbaikan proses berikutnya.",
      ),
    ],
  },
  {
    title: "Fitur Baru: Laporan Terjadwal di Kodeva Reports",
    slug: "fitur-baru-laporan-terjadwal",
    category: "Product Update",
    excerpt:
      "Jadwalkan laporan harian atau mingguan dan terima otomatis via email — sekarang tersedia untuk semua paket Reports.",
    coverImage: {
      url: "/images/blog/reports-dashboard.svg",
      alt: "Ilustrasi dashboard laporan terjadwal",
    },
    publishedAt: "2026-12-11T09:00:00.000Z",
    published: false,
    relatedProductIds: ["reports"],
    body: [
      p(
        "Laporan yang bagus tidak berguna kalau harus dibuka manual. Mulai versi ini, kamu bisa menjadwalkan laporan apa pun untuk dikirim otomatis.",
      ),
      h2("Jadwal harian, mingguan, atau bulanan"),
      p(
        "Pilih siapa penerima dan berapa sering laporan dikirim. Format Excel dan PDF tersedia.",
      ),
      h2("Tersedia mulai Paket Basic"),
      p(
        "Fitur ini langsung aktif untuk semua pelanggan Kodeva Reports tanpa biaya tambahan.",
      ),
    ],
  },
];

/* --------------------------------- aggregate -------------------------------- */

export const landingContent: LandingContent = {
  hero,
  featuredProductIds,
  testimonials,
  faq,
};

export const fixtures = {
  landingContent,
  products,
  articles,
};
