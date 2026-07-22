import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Rendu Markdown des descriptions produit (titres, listes, gras, liens, images).
 * Le HTML brut n'est pas interprété (sécurisé par défaut). Styles : `.markdown`
 * dans globals.css. Les images sont insérées via la syntaxe `![alt](url)`.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
