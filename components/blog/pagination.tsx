import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) =>
    page <= 1 ? basePath : `${basePath}/page/${page}`;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-10 flex items-center justify-center gap-3"
    >
      {currentPage > 1 ? (
        <Link
          href={hrefFor(currentPage - 1)}
          rel="prev"
          className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          ← Sebelumnya
        </Link>
      ) : null}
      <span className="text-sm text-muted-foreground">
        Halaman {currentPage} dari {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link
          href={hrefFor(currentPage + 1)}
          rel="next"
          className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Selanjutnya →
        </Link>
      ) : null}
    </nav>
  );
}
