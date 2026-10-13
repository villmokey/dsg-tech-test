import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getProducts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Selesaikan pesanan lisensi Kodeva (pembayaran disimulasikan).",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pembayaran disimulasikan untuk demo — tidak ada transaksi sungguhan.
      </p>
      <div className="mt-8">
        <CheckoutForm products={products} />
      </div>
    </main>
  );
}
