import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/article-card";
import { Pagination } from "@/components/blog/pagination";
import { getArticlePage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips operasional, studi kasus, dan kabar produk Kodeva untuk bisnis kecil dan menengah.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const { articles, page, totalPages } = await getArticlePage(1);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Tips operasional, studi kasus pelanggan, dan kabar produk — ditulis tim
        Kodeva.
      </p>
      {articles.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {articles.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-border bg-muted p-6 text-sm text-muted-foreground">
          Belum ada artikel yang dipublikasikan.
        </p>
      )}
      <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
    </main>
  );
}
