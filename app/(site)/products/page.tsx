import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/marketplace/catalog";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Semua produk Kodeva: POS, HR & payroll, dan add-on berlangganan bulanan. Promo Akhir Tahun dengan kuota lisensi terbatas.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Katalog Produk
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Pilih produk, tentukan paket, dan atur jumlah lisensi. Kuota promo
        dihitung dari total lisensi per produk.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat katalog…</p>}>
          <Catalog products={products} />
        </Suspense>
      </div>
    </main>
  );
}
