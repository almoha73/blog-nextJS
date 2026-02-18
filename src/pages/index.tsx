import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { db, storage } from "./api/firebase";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Article } from "../types/type";
import DropdownMenu from "../components/DropdownMenu";

enum SortOption {
  DateDesc,
  DateAsc,
  TitreAsc,
  TitreDesc,
  Theme,
}

export const sortOptions = [
  { label: "Date ⬇️", value: SortOption.DateDesc },
  { label: "Date ⬆️", value: SortOption.DateAsc },
  { label: "Titre ⬆️", value: SortOption.TitreAsc },
  { label: "Titre ⬇️", value: SortOption.TitreDesc },
  { label: "Thème", value: SortOption.Theme },
];

const Index = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DateDesc);
  const [searchValue, setSearchValue] = useState("");
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = async () => {
    try {
      const articlesRef = collection(db, "articles");
      const q = query(articlesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetched: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        let createdAtStr = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === "function") {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (data.createdAt.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
          }
        }

        fetched.push({
          id: doc.id,
          title: data.title || "Sans titre",
          content: data.content || "",
          file: data.file || null,
          fileType: data.fileType || null,
          createdAt: createdAtStr,
          theme: data.theme || "Général",
        });
      });

      setArticles(fetched);
    } catch (error) {
      console.error("Erreur lors du chargement des articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteShortcut = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation(); // Empêche d'ouvrir l'article
    setArticleToDelete(article); // Ouvre la modale de confirmation
  };

  const confirmDelete = async () => {
    if (!articleToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      // 1. Supprimer le fichier du Storage si présent
      if (articleToDelete.file) {
        try {
          const fileRef = ref(storage, articleToDelete.file);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Fichier Storage non trouvé ou déjà supprimé:", storageErr);
        }
      }

      // 2. Supprimer de Firestore
      await deleteDoc(doc(db, "articles", articleToDelete.id));

      // 3. Mettre à jour l'état local pour un effet immédiat
      setArticles(prev => prev.filter(a => a.id !== articleToDelete.id));
      setArticleToDelete(null);
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression : " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  function handleArticleClick(articleId: string) {
    router.push(`/articles/${articleId}`);
  }

  const filteredAndSortedArticles = articles
    .filter(
      (article) =>
        (article.title ?? "")
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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Navbar />

      {/* Modale de confirmation de suppression */}
      {articleToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-red-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Supprimer ce neurone ?</h2>
              <p className="text-slate-500 font-medium">
                Le neurone <span className="font-bold text-slate-700">"{articleToDelete.title}"</span> sera supprimé définitivement. Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-200 border-t-white rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  "Oui, supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="text-center py-16 animate-float">
            <h1 className="text-5xl lg:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-coral-500 drop-shadow-sm">
              🧠 Cerveau en vrac !
            </h1>
            <p className="text-xl text-slate-700 font-medium">
              Explorez les connexions de ma pensée créative.
            </p>
          </div>

          {/* Action Bar */}
          <div className="relative z-40 glass-card p-6 mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                className="glass-input w-full sm:w-80"
                placeholder="Chercher un concept ou un thème..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <DropdownMenu
                onSelect={(option: SortOption) => setSortOption(option)}
                options={sortOptions}
              />
            </div>

            <button
              onClick={() => router.push("/articles/new")}
              className="neuron-btn w-full md:w-auto flex items-center justify-center gap-2"
            >
              <span className="text-2xl">➕</span> Créer un nouveau neurone
            </button>
          </div>

          {/* Articles Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              ))
            ) : filteredAndSortedArticles.length > 0 ? (
              filteredAndSortedArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className={`glass-card group overflow-hidden flex flex-col h-full cursor-pointer relative transition-all duration-300 ${article.file
                    ? "border-teal-200/60 bg-gradient-to-br from-white/80 to-teal-50/30 shadow-teal-900/5 hover:shadow-teal-900/10"
                    : "border-white/40"
                    }`}
                >
                  {/* Indicateur de média en haut à gauche pour les fichiers */}
                  {article.file && (
                    <div className="absolute top-0 left-0 bg-teal-500 text-white text-[10px] font-black px-2 py-1 rounded-br-xl shadow-sm z-10 tracking-tighter uppercase">
                      Media
                    </div>
                  )}

                  {/* Bouton de suppression rapide */}
                  <button
                    onClick={(e) => handleDeleteShortcut(e, article)}
                    className="absolute top-4 right-4 z-20 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                    title="Supprimer rapidement"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${article.file ? "bg-teal-200 text-teal-800" : "bg-teal-100 text-teal-700"
                        }`}>
                        {article.theme || "Général"}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(article.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4 italic">
                      {article.content?.substring(0, 120) ?? "Pas de contenu..."}
                    </p>
                  </div>

                  <div className={`px-6 py-4 border-t border-white/20 flex justify-between items-center ${article.file ? "bg-teal-50/50" : "bg-slate-50/50"
                    }`}>
                    <div className="flex items-center gap-2">
                      {article.file ? (
                        <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs">
                          <span className="text-lg">📎</span>
                          <span>Fichier inclus</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Texte uniquement
                        </span>
                      )}
                    </div>
                    <span className={`font-bold group-hover:translate-x-1 transition-transform ${article.file ? "text-teal-600" : "text-teal-500"
                      }`}>
                      Lire plus →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass-card !bg-white/50 border-dashed border-2">
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-2xl font-black text-slate-800 mb-4">
                  {searchValue ? "Aucun résultat trouvé" : "Votre cerveau est encore en friche !"}
                </h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">
                  {searchValue
                    ? `Nous n'avons trouvé aucun neurone correspondant à "${searchValue}".`
                    : "Créez votre premier neurone pour commencer."}
                </p>
                {!searchValue && (
                  <button
                    onClick={() => router.push("/articles/new")}
                    className="neuron-btn inline-flex items-center gap-2"
                  >
                    Créer mon premier neurone
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
