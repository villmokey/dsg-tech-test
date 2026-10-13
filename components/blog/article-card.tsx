import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/site-config";
import type { Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {article.coverImage?.url ? (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center bg-brand-soft text-2xl font-bold text-brand"
          >
            K
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-semibold text-brand">{article.category}</p>
        <h3 className="font-semibold leading-snug group-hover:text-brand">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <time
          dateTime={article.publishedAt}
          className="mt-auto pt-2 text-xs text-muted-foreground"
        >
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
