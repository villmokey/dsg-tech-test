"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Terjadi kesalahan
      </h1>
      <p className="max-w-md text-muted-foreground">
        Sesuatu salah di sisi kami. Coba muat ulang halaman.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Kode error: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        Coba lagi
      </button>
    </main>
  );
}
