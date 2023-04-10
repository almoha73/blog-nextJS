import React from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db } from "../api/firebase";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import "highlight.js/styles/default.css";
import { useEffect, useState, useRef } from "react";
import FileDisplay from "@/components/FileDisplay";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import xml from "react-syntax-highlighter/dist/cjs/languages/hljs/xml";
import css from "react-syntax-highlighter/dist/cjs/languages/hljs/css";


SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("css", css);

interface ArticleDetailProps {
  articles: Article;
}

const ArticleDetail = ({ articles }: ArticleDetailProps) => {
  // Utilisez cet ID pour afficher les détails de l'article correspondant
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      await deleteDoc(doc(db, "articles", articles.id));
      router.push("/");
    }
  };

  const handleEdit = () => {
    router.push(`/articles/${articles.id}/edit`);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(isMobile);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [articles.content]);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 ">
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex justify-between items-center mb-6 mx-2 border p-2 bg-white">
            <div className="lg:text-3xl font-bold break-words">
              <div className=" mr-2 p-1 mb-2">
                <span className="bg-[#A7EDD6] mr-2 px-2">Thème</span>
                {articles && articles.theme}
              </div>
              <div className=" mr-2 p-1 ">
                <span className="bg-[#F8E1C7] mr-2 px-2">Titre</span>
                {articles && articles.title}
              </div>
            </div>
            <div className="flex">
              <button
                className={`${
                  isMobile
                    ? " bg-[#82E4D0] text-white"
                    : "bg-[#82E4D0] text-white"
                } font-bold py-1 md:px-4 px-2 rounded mr-2 ${
                  isMobile ? "text-lg " : ""
                }`}
                onClick={handleEdit}
              >
                {isMobile ? "✎" : "Edit"}
              </button>
              <button
                className={`${
                  isMobile ? " bg-[#BD99A0] text-white" : "bg-[#BD99A0] text-white"
                } font-bold py-1 md:px-4 px-2 rounded ${
                  isMobile ? "text-lg " : ""
                }`}
                onClick={handleDelete}
              >
                {isMobile ? "✕" : "Supprimer"}
              </button>
            </div>
          </div>
          {!articles ? (
            <p>Chargement...</p>
          ) : (
            articles && (
              <article className="mx-auto w-[300px] sm:w-11/12 ">
                <div
                  key={articles.id}
                  className="p-6 mb-6 bg-white rounded-lg shadow-md "
                >
                  {articles && articles.fileType ? (
                    <FileDisplay
                      file={articles.file}
                      fileType={articles.fileType}
                      title={articles.title}
                    />
                  ) : (
                    <p className="text-[#245165] mb-2 bg-[#FBDDBE] inline-block px-2 py-1 text-xs">
                      Cet article ne contient pas de pièces jointes
                    </p>
                  )}

                  {/* si le contenu de l'article contient du code, on affiche ce bout de code avec la syntaxe colorée et le reste normal, sinon on affiche l'article en prose */}
                  <p className=" text-justify whitespace-break-spaces		break-words bg-gray-100 p-2">
                    {articles.content}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;

export async function getServerSideProps(context: any) {
  const articleId = context.query.articleId;

  const docRef = doc(db, "articles", articleId);
  const docSnap = await getDoc(docRef);

  let articles: Article | null = null;

  if (docSnap.exists()) {
    articles = {
      id: docSnap.id,
      title: docSnap.data().title,
      content: docSnap.data().content,
      createdAt: docSnap.data().createdAt.toMillis(),
      file: docSnap.data().file ?? null,
      fileType: docSnap.data().fileType ?? null,
      theme: docSnap.data().theme,
    };
  } else {
    console.log("No such document!");
  }

  return {
    props: {
      articles,
    },
  };
}
