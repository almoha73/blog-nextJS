import React, {useState} from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "./api/firebase";
import { collection, getDocs} from "firebase/firestore";
import { Article } from "../types/type";
import DropdownMenu from "../components/DropdownMenu";


interface IndexProps {
  articles: Article[];
}

enum SortOption { DateAsc, DateDesc, NameAsc, NameDesc , Theme } // Définir les options de tri

export const sortOptions = [
  { label: "Date ⬆️", value: SortOption.DateAsc },
  { label: "Date ⬇️", value: SortOption.DateDesc },
  { label: "Nom ⬆️", value: SortOption.NameAsc },
  { label: "Nom ⬇️", value: SortOption.NameDesc },
  { label: "Thème", value: SortOption.Theme },
];

const Index = ({ articles: unsortedArticles }: IndexProps) => {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DateAsc); // Définir l'état local pour l'option de tri

  function handleArticleClick(articleId: string) {
    router.push(`/articles/${articleId}`);
  }

  // Effectuer le tri des articles en fonction de l'option sélectionnée
  const articles = [...unsortedArticles].sort((a, b) => {
    if (sortOption === SortOption.NameDesc) {
      return b.title.localeCompare(a.title);
    } else if
     (sortOption === SortOption.NameAsc) {
      return a.title.localeCompare(b.title);
    } else if (sortOption === SortOption.Theme) {
      return (a.fileType ?? "").localeCompare(b.fileType ?? "");
    } else if (sortOption === SortOption.DateDesc) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {  // SortOption.DateAsc
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

      
  });

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      {/* Main content = contenu de la page d'accueil d'un blog */}
      <main className="flex-grow">
        {/* liste des articles */}
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center my-8">Blog</h1>
          {/* Menu déroulant pour trier les articles */}
          <div className="flex justify-center mb-8">
          <DropdownMenu onSelect={(option: SortOption) => setSortOption(option)} options={sortOptions}/>

          </div>
          {/*bouton pour créer un nouvel article */}
          <div className="flex justify-center mb-8">
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
                className="bg-white rounded-lg shadow-lg p-4 cursor-pointer"
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
              >
                <h2 className="text-xl font-bold">{article.title}</h2>
                <p className="text-gray-600">{new Date(article.createdAt).toLocaleString()}</p>
                {article.file && <p>{article.fileType}</p>}
                <p className="text-gray-600">
                  {article.content?.substring(0, 100) ?? ""}
                </p>
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


export async function getServerSideProps() {
  const articles: Article[] = [];
  const querySnapshot = await getDocs(collection(db, 'articles'))
  querySnapshot.forEach((doc) => {
    articles.push({
      id: doc.id,
      title: doc.data().title,
      content: doc.data().content,
      file: doc.data().file || null,
      fileType: doc.data().fileType || null,
      createdAt: doc.data().createdAt.toDate().toISOString(), // Convertir en chaîne ISO
    })
  })

  return {
    props: { articles },
  }
}