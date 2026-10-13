import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-md text-muted-foreground">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan. Coba
        jelajahi katalog atau blog kami.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Beranda
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Katalog Produk
        </Link>
        <Link
          href="/blog"
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Blog
        </Link>
      </div>
    </main>
  );
}
