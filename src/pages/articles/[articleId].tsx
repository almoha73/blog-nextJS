import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db } from "../api/firebase";
import { getDoc, doc } from "firebase/firestore";

const ArticleDetail = () => {
  // Utilisez cet ID pour afficher les détails de l'article correspondant
  const router = useRouter();
  const { articleId } = router.query; // récupère l'ID de l'article à partir de l'URL

  const [articles, setArticles] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Router query:", router.query);
    if (!router.isReady) return;
    if (articleId && typeof articleId === "string") {
      const getArticle = async () => {
        const docRef = doc(db, "articles", articleId);
        console.log(docRef);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArticles({
            id: docSnap.id,
            title: docSnap.data().title,
            content: docSnap.data().content,
            image: docSnap.data().image, 
        
          });
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      };

      getArticle();
    }
  }, [articleId, router.isReady, router.query]);

  console.log(articles);

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      <main className="flex-1 bg-gray-100">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-3xl font-bold mb-4">Article détails</h1>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            articles && (
              <article>
                <div key={articles.id} className="p-6 mb-6 bg-white rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-2">{articles.title}</h2>
                  {articles.image && (
                   <Image
                   src={articles.image}
                   alt={articles.title}
                    width={400}
                    height={400}
                   quality={100}
                   className="w-40 h-40"
                   style={ {objectFit: 'cover'}}
                 />
                  )}
                  <p className="text-gray-600">{articles.content}</p>
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
