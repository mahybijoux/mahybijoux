import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INFO_PAGES } from "@/content/pages";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(INFO_PAGES).map((page) => ({ page }));
}

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const content = INFO_PAGES[page];
  if (!content) return {};
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: `/${page}` },
    openGraph: { title: content.title, description: content.description, url: `/${page}` },
    robots: content.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function InfoPage({ params }: Props) {
  const { page } = await params;
  const content = INFO_PAGES[page];
  if (!content) notFound();

  return (
    <div className="container-page pt-8 pb-20">
      <Breadcrumbs
        items={[
          { href: "/", label: "Accueil" },
          { href: `/${page}`, label: content.title },
        ]}
      />
      <article className="mx-auto mt-10 max-w-2xl">
        <p className="eyebrow text-terracotta-deep">{content.eyebrow}</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{content.h1}</h1>
        <div className="prose-shop mt-8">{content.body}</div>
      </article>
    </div>
  );
}
