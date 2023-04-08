import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db } from "../api/firebase";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { useEffect, useState } from "react";
import FileDisplay from "@/components/FileDisplay";

const ArticleDetail = ({ articles }: { articles: Article }) => {
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
    hljs.highlightAll();

    const checkIfMobile = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(isMobile);
    };

    checkIfMobile(); // Vérifiez si l'appareil est un mobile lors du montage du composant
    window.addEventListener("resize", checkIfMobile); // Ajoutez un écouteur d'événements pour le redimensionnement de la fenêtre

    // Nettoyez l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 bg-gray-100">
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex justify-between items-center mb-6  mx-2">
            <h1 className="lg:text-3xl font-bold">
              {articles && articles.theme}: {articles && articles.title}
            </h1>
            <div>
              <button
                className={`${
                  isMobile ? " bg-blue-500 text-white" : "bg-blue-500 text-white"
                } font-bold py-2 md:px-4 px-2 rounded mr-2 ${
                  isMobile ? "text-xl " : ""
                }`}
                onClick={handleEdit}
              >
                {isMobile ? "✎" : "Edit"}
              </button>
              <button
                className={`${
                  isMobile ? " bg-red-500 text-white" : "bg-red-500 text-white"
                } font-bold py-2 md:px-4 px-2 rounded ${
                  isMobile ? "text-xl " : ""
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
              <article className="mx-auto w-[300px] sm:w-11/12">
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
                    <p>Aucun fichier à afficher</p>
                  )}

                  <div
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlightAuto(articles.content).value,
                    }} // articles.
                    style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" } } className="text-xs md:text-base"
                  ></div>
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
