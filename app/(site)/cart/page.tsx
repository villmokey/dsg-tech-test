import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Tinjau lisensi yang kamu pilih sebelum checkout.",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Keranjang
      </h1>
      <p className="mt-3 text-muted-foreground">
        Atur jumlah lisensi per produk. Kuota promo dihitung dari total
        lisensi per produk, semua paket.
      </p>
      <div className="mt-8">
        <CartView products={products} />
      </div>
    </main>
  );
}
