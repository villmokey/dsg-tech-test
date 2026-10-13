import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import { getArticlePage } from "@/lib/content";

export async function generateStaticParams() {
  const { totalPages } = await getArticlePage(1);
  // Page 1 is handled by /blog itself; generate pages 2..N.
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/page/[page]">): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    return {};
  }
  return {
    title: `Blog — Halaman ${pageNumber}`,
    description: `Artikel Kodeva, halaman ${pageNumber}.`,
    alternates: { canonical: `/blog/page/${pageNumber}` },
  };
}

export default async function BlogPaginatedPage({
  params,
}: PageProps<"/blog/page/[page]">) {
  const { page } = await params;
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const { articles, totalArticles, totalPages } =
    await getArticlePage(pageNumber);

  // Out-of-range pages (e.g. /blog/page/99) are not found, not empty.
  if (articles.length === 0 || pageNumber > totalPages) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {totalArticles} artikel — halaman {pageNumber} dari {totalPages}.
      </p>
      <ul className="mt-8 grid gap-5 sm:grid-cols-2">
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
      <Pagination currentPage={pageNumber} totalPages={totalPages} basePath="/blog" />
    </main>
  );
}
