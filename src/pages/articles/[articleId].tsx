import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db, storage } from "../api/firebase";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import "highlight.js/styles/default.css";
import FileDisplay from "@/components/FileDisplay";
import ArticleCard from "@/components/ArticleCard";

const ArticleDetail = () => {
  const router = useRouter();
  const { articleId } = router.query;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!articleId || typeof articleId !== "string") return;

    const fetchArticle = async () => {
      try {
        const docRef = doc(db, "articles", articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          let createdAtStr = new Date().toISOString();
          if (data.createdAt?.toDate) {
            createdAtStr = data.createdAt.toDate().toISOString();
          } else if (data.createdAt?.seconds) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
          }

          setArticle({
            id: docSnap.id,
            title: data.title || "Sans titre",
            content: data.content || "",
            createdAt: createdAtStr,
            file: data.file ?? null,
            fileType: data.fileType ?? null,
            theme: data.theme || "Général",
          });
        }
      } catch (error) {
        console.error("Erreur chargement article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const confirmDelete = async () => {
    if (!article || isDeleting) return;
    setShowConfirmModal(false);
    setIsDeleting(true);

    try {
      // 1. Supprimer le fichier du Storage si présent
      if (article.file) {
        try {
          const fileRef = ref(storage, article.file);
          await deleteObject(fileRef);
        } catch (e) {
          console.warn("Fichier non supprimé du Storage (peut-être déjà inexistant):", e);
        }
      }

      // 2. Supprimer le document Firestore
      await deleteDoc(doc(db, "articles", article.id));

      // 3. Redirection vers l'accueil
      router.push("/");
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression : " + error.message);
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!article) return;
    router.push(`/articles/${article.id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold">Récupération des données du neurone...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-500 font-bold">Neurone introuvable.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <Navbar />

      {/* Modale de confirmation de suppression */}
      {showConfirmModal && (
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
                Le neurone <span className="font-bold text-slate-700">"{article.title}"</span> sera supprimé définitivement. Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-sm"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Article Header Card */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-teal-100 text-teal-700">
                    {article.theme || "Général"}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">
                    Identité neuronale : #{article.id.substring(0, 6)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  {article.title}
                </h1>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleEdit}
                  className="flex-1 md:flex-none px-6 py-3 bg-white/50 hover:bg-white text-slate-600 font-bold rounded-2xl border border-white/60 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="text-lg">✎</span> Modifier
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isDeleting}
                  className={`flex-1 md:flex-none px-6 py-3 font-bold rounded-2xl border transition-all flex items-center justify-center gap-2 shadow-sm ${isDeleting
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-red-50 hover:bg-red-100 text-red-500 border-red-100"
                    }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                      Suppression...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🗑️</span> Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="glass-card p-4 md:p-8">
            <div className="prose prose-slate max-w-none">
              <ArticleCard article={article} />
            </div>
          </div>

          {/* Pièce jointe */}
          {article.file && article.fileType && (
            <div className="glass-card p-6 mt-8">
              <h2 className="text-lg font-bold text-slate-700 mb-4">📎 Pièce jointe</h2>
              <FileDisplay file={article.file} fileType={article.fileType} title={article.title} />
            </div>
          )}

          <div className="mt-8 text-center text-slate-400 font-medium">
            <button onClick={() => router.push("/")} className="hover:text-teal-500 transition-colors">
              ← Revenir au réseau complet
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;
