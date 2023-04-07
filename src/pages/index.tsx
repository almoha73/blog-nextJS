import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "./api/firebase";
import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { Article } from "../types/type";
import Image from "next/image";


const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "articles"),
      (snapshot: QuerySnapshot) => {
        setArticles(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            content: doc.data().content,
            image: doc.data().image,
          }))
        );
      }
    );
    return unsubscribe;
  }, []);

  function handleArticleClick(articleId: string) {
    router.push(`/articles/${articleId}`);
  }

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      {/* Main content = contenu de la page d'accueil d'un blog */}
      <main className="flex-grow">
        {/* liste des articles */}
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center my-8">Blog</h1>
          {/*bouton pour créer un nouvel article */}
          <div className="flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push("/articles/new")}
            >
              Créer un nouvel article
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <div
                className="bg-white rounded-lg shadow-lg p-4"
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
              >
                <h2 className="text-xl font-bold">{article.title}</h2>
                {article.image && (
                   <Image
                   src={article.image}
                   alt={article.title}
                    width={100}
                    height={100}
                   quality={100}
                   style={ {objectFit: 'cover'}}
                 />
                  )}
                <p className="text-gray-600">{article.content?.substring(0, 100) ?? ""}</p>

              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
