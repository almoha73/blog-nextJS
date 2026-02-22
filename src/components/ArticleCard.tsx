// ArticleCard.tsx
import React, { useEffect, useState } from "react";
import FileDisplay from "@/components/FileDisplay";
import { Article } from "@/types/type";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark as dark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface ArticleCardProps {
  article: Article;
  showFile?: boolean; // Nouvelle prop pour décider d'afficher le fichier ou non
}

function isCodeBlock(text: string) {
  return text.startsWith("<code>") && text.endsWith("</code>");
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, showFile = false }) => {
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setContent(article.content);
  }, [article.content]);

  useEffect(() => {
    setBlocks(
      content.split("\n\n").map((block, index) => {
        if (isCodeBlock(block)) {
          const code = block.slice("<code>".length, -"</code>".length).trim();

          return (
            <SyntaxHighlighter
              key={index}
              style={dark}
              customStyle={{
                borderRadius: "1rem",
                padding: "1.5rem",
                backgroundColor: "rgba(2, 6, 23, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {code}
            </SyntaxHighlighter>
          );
        } else {
          return (
            <p className="whitespace-pre-wrap break-word prose text-slate-300 leading-relaxed mb-6 font-medium" key={index}>
              {block}
            </p>
          );
        }
      })
    );
  }, [content, article]);

  return (
    <div key={article.id} className="w-full">
      <div className="mb-2">
        {blocks}
      </div>

      {showFile && article && article.file && article.fileType && (
        <div className="mt-8 pt-8 border-t border-slate-800/60">
          <FileDisplay
            file={article.file}
            fileType={article.fileType}
            title={article.title}
          />
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
