// ArticleCard.tsx
import React, { useEffect, useState } from "react";
import FileDisplay from "@/components/FileDisplay";
import { Article } from "@/types/type";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface ArticleCardProps {
  article: Article;
}

function isCodeBlock(text: string) {
  return text.startsWith("<code>") && text.endsWith("</code>");
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState<React.ReactNode[]>([]);

  // // Mettez à jour le contenu lorsque `article.content` change
  useEffect(() => {
    setContent(article.content);
  }, [article.content]);

  // Mettez à jour les blocs lorsque `content` change
  useEffect(() => {
    setBlocks(
      content.split("\n\n").map((block, index) => {
        if (isCodeBlock(block)) {
          const code = block.slice("<code>".length, -"</code>".length).trim();

          return (
            <SyntaxHighlighter
              key={index}
              style={docco}
              wrapLines={true}
              wrapLongLines={true}
            >
              {code}
            </SyntaxHighlighter>
          );
        } else {
          return (
            <p className="whitespace-pre-wrap break-word prose" key={index}>
              {block}
            </p>
          );
        }
      })
    );
  }, [content, article]);

  return (
    <article className="mx-auto w-11/12 ">
      <div key={article.id} className="mb-6 bg-white rounded-lg shadow-md p-3">
        <div>{blocks}</div>

        {article && article.fileType ? (
          <FileDisplay
            file={article.file}
            fileType={article.fileType}
            title={article.title}
          />
        ) : (
          <p className="text-[#245165] mb-2 bg-[#FBDDBE] inline-block px-2 py-1 text-xs">
            Cet article ne contient pas de pièces jointes
          </p>
        )}
      </div>
    </article>
  );
};

export default ArticleCard;
