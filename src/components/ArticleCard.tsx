// ArticleCard.tsx
import React from "react";
import FileDisplay from "@/components/FileDisplay";
import { Article } from "@/types/type";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <article className="mx-auto w-[300px] sm:w-11/12 ">
      <div key={article.id} className="p-6 mb-6 bg-white rounded-lg shadow-md ">
        <p className=" text-justify whitespace-break-spaces break-words bg-gray-100 p-2">
          {article.content}
        </p>
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
