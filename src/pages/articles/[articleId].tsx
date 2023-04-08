import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db } from "../api/firebase";
import { getDoc, doc } from "firebase/firestore";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { useEffect } from "react";

const ArticleDetail = ({ articles }: { articles: Article }) => {
  // Utilisez cet ID pour afficher les détails de l'article correspondant
  //const router = useRouter();
  

  useEffect(() => {
    hljs.highlightAll();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      <main className="flex-1 bg-gray-100">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-3xl font-bold mb-4">Article détails</h1>
          {!articles ? (
            <p>Chargement...</p>
          ) : (
            articles && (
              <article>
                <div
                  key={articles.id}
                  className="p-6 mb-6 bg-white rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-bold mb-2">{articles.theme}: {articles.title}</h2>

                  {articles && articles.fileType ? (
                    articles.fileType.startsWith("image") ? (
                      <Image
                        src={articles.file}
                        alt={articles.title}
                        width={400}
                        height={400}
                        quality={100}
                        className="w-40 h-40"
                        style={{ objectFit: "cover" }}
                      />
                    ) : articles.fileType.startsWith("video") ? (
                      <video width="320" height="240" controls>
                        <source src={articles.file} type={articles.fileType} />
                        Your browser does not support the video tag.
                      </video>
                    ) : articles.fileType === "application/pdf" ? (
                      <embed
                        src={articles.file}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                      />
                    ) : articles.fileType ===
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                      <a
                        href={articles.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Télécharger le document Word
                      </a>
                    ) : (
                      <p>Type de fichier non pris en charge</p>
                    )
                  ) : (
                    <p>Aucun fichier à afficher</p>
                  )}

                  
                  <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(articles.content).value }} style={{ whiteSpace: "pre-wrap" }}></div>

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
