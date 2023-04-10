import React, { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db } from "./api/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { Article } from "../types/type";
import DropdownMenu from "../components/DropdownMenu";
import CustomButton from "@/components/CustomButton";

interface IndexProps {
  articles: Article[];
}

enum SortOption {
  DateDesc,
  DateAsc,
  TitreAsc,
  TitreDesc,
  Theme,
} // Définir les options de tri

export const sortOptions = [
  { label: "Date ⬇️", value: SortOption.DateDesc },
  { label: "Date ⬆️", value: SortOption.DateAsc },
  { label: "Titre ⬆️", value: SortOption.TitreAsc },
  { label: "Titre ⬇️", value: SortOption.TitreDesc },
  { label: "Thème", value: SortOption.Theme },
];

const Index = ({ articles }: IndexProps) => {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DateDesc); // Définir l'état local de départ pour l'option de tri
  const [searchValue, setSearchValue] = useState(""); // Ajouter un état local pour la valeur de recherche

  function handleArticleClick(articleId: string) {
    router.push(`/articles/${articleId}`);
  }

  // Effectuer le tri des articles en fonction de l'option sélectionnée
  const filteredAndSortedArticles = articles
    .filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase()) ||
        (article.theme ?? "")
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === SortOption.TitreDesc) {
        return b.title.localeCompare(a.title);
      } else if (sortOption === SortOption.TitreAsc) {
        return a.title.localeCompare(b.title);
      } else if (sortOption === SortOption.Theme) {
        return (a.theme ?? "").localeCompare(b.theme ?? "");
      } else if (sortOption === SortOption.DateDesc) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        // SortOption.DateAsc
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      {/* Main content = contenu de la page d'accueil d'un blog */}
      <main className="flex-grow mb-8">
        {/* liste des articles */}
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center my-8 text-white">Pense-Bête</h1>
          {/* Menu déroulant pour trier les articles */}
          <div className="flex justify-center mb-8">
            <DropdownMenu
              onSelect={(option: SortOption) => setSortOption(option)}
              options={sortOptions}
            />
          </div>
          {/* Ajouter un champ de texte pour la recherche */}
          <div className="flex justify-center mb-8 ">
            <input
              type="text"
              className="border p-2 rounded w-80"
              placeholder="Rechercher par titre ou thème"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          {/*bouton pour créer un nouvel article */}
          <div className="flex justify-center mb-8">
            <CustomButton
                bgColor="#82E4D0"
                textColor="white"
                text="Créer un nouveau pense-bête"
                type="button"
                onClick={() => router.push("/articles/new")}/>
            {/*  */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedArticles.map((article) => (
              <div
                className="bg-white rounded-lg shadow-lg p-4 cursor-pointer"
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
              >
                <div className="text-xl font-bold">
                  <div className=" mr-2  mb-3">
                    <span className="bg-blue-100 mr-2 p-1">Thème</span>
                    {articles && article.theme}
                  </div>
                  <div className=" mr-2 mb-2">
                    <span className="bg-orange-100 mr-2 p-1">Titre</span>
                    {articles && article.title}
                  </div>
                </div>
                <p className="text-gray-600 bg-red-100 inline-block p-1 mb-4">
                  {new Date(article.createdAt).toLocaleString()}
                </p>
                {article.file && <p>{article.fileType}</p>}
                <p className="text-gray-600 whitespace-normal break-words bg-gray-100 p-2 rounded-xl">
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
  const querySnapshot = await getDocs(
    query(collection(db, "articles"), orderBy("createdAt", "desc"), limit(20))
  );
  querySnapshot.forEach((doc) => {
    articles.push({
      id: doc.id,
      title: doc.data().title,
      content: doc.data().content,
      file: doc.data().file || null,
      fileType: doc.data().fileType || null,
      createdAt: doc.data().createdAt.toDate().toISOString(), // Convertir en chaîne ISO
      theme: doc.data().theme,
    });
  });

  return {
    props: { articles },
  };
}
