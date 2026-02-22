// pages/articles/[articleId]/edit.tsx
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { db, storage } from "../../api/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Article } from "../../../types/type";

const EditArticle = () => {
  const router = useRouter();
  const { articleId } = router.query;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [content, setContent] = useState("");

  // Gestion de la pièce jointe
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [currentFileType, setCurrentFileType] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // Charger l'article côté client
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

          const loaded: Article = {
            id: docSnap.id,
            title: data.title || "",
            content: data.content || "",
            createdAt: createdAtStr,
            file: data.file ?? null,
            fileType: data.fileType ?? null,
            theme: data.theme || "",
          };

          setArticle(loaded);
          setTitle(loaded.title);
          setTheme(loaded.theme);
          setContent(loaded.content);
          setCurrentFileUrl(loaded.file);
          setCurrentFileType(loaded.fileType);
        }
      } catch (err) {
        console.error("Erreur chargement article:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    setIsUpdating(true);
    setError("");

    try {
      let finalFileUrl = currentFileUrl || "";
      let finalFileType = currentFileType || "";

      console.log("[EDIT] removeFile:", removeFile, "| newFile:", newFile?.name);

      // Cas 1 : L'utilisateur veut supprimer la pièce jointe
      if (removeFile) {
        if (currentFileUrl) {
          try {
            const fileRef = ref(storage, currentFileUrl);
            await deleteObject(fileRef);
            console.log("[EDIT] Fichier supprimé du Storage");
          } catch (e) {
            console.warn("[EDIT] Impossible de supprimer le fichier du Storage:", e);
          }
        }
        finalFileUrl = "";
        finalFileType = "";
      }

      // Cas 2 : L'utilisateur a choisi un nouveau fichier (avec ou sans ancien fichier)
      if (newFile) {
        console.log("[EDIT] Upload du nouveau fichier:", newFile.name, newFile.type, newFile.size, "bytes");
        const uniqueFileName = `${Date.now()}-${newFile.name}`;
        const storageRef = ref(storage, `files/${uniqueFileName}`);
        const snapshot = await uploadBytes(storageRef, newFile);
        console.log("[EDIT] Upload réussi:", snapshot.metadata.fullPath);
        finalFileUrl = await getDownloadURL(storageRef);
        finalFileType = newFile.type;
        console.log("[EDIT] URL du nouveau fichier:", finalFileUrl);
      }

      console.log("[EDIT] Mise à jour Firestore avec file:", finalFileUrl, "fileType:", finalFileType);
      await updateDoc(doc(db, "articles", article.id), {
        title,
        theme,
        content,
        file: finalFileUrl,
        fileType: finalFileType,
      });

      router.push(`/articles/${article.id}`);
    } catch (err: any) {
      console.error("Erreur mise à jour:", err);
      setError("Impossible de mettre à jour le neurone : " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Récupération du neurone...</p>
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
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="glass-card p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                ✎ Modifier le Neurone
              </h1>
              <p className="text-slate-400 font-medium tracking-wide">Affinez votre pensée neuronale.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-950/20 border border-red-500/30 text-red-500 rounded-2xl text-sm font-black flex items-center gap-2">
                <span>❌</span> {error}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Titre */}
              <div>
                <label className="block text-slate-300 font-black uppercase tracking-widest text-xs mb-3 ml-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full font-semibold"
                  required
                />
              </div>

              {/* Thème */}
              <div>
                <label className="block text-slate-300 font-black uppercase tracking-widest text-xs mb-3 ml-1">Thème / Catégorie</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="glass-input w-full"
                  required
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-slate-300 font-black uppercase tracking-widest text-xs mb-3 ml-1">Contenu</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="glass-input w-full h-64 resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Pièce jointe */}
              <div>
                <label className="block text-slate-300 font-black uppercase tracking-widest text-xs mb-3 ml-1">Pièce jointe</label>

                {/* Affichage de la pièce jointe actuelle */}
                {currentFileUrl && !removeFile && (
                  <div className="mb-4 p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">
                        {currentFileType?.startsWith("image/") ? "🖼️" :
                          currentFileType === "application/pdf" ? "📄" :
                            currentFileType?.startsWith("video/") ? "🎬" : "📎"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Fichier actuel</p>
                        <p className="text-xs text-slate-400 truncate">{currentFileType}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={currentFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-slate-900 rounded-xl border border-cyan-500/20 hover:bg-slate-800 transition-colors"
                      >
                        Voir
                      </a>
                      <button
                        type="button"
                        onClick={() => setRemoveFile(true)}
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 bg-slate-900 rounded-xl border border-red-500/20 hover:bg-slate-800 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}

                {/* Message si suppression demandée */}
                {removeFile && (
                  <div className="mb-4 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-red-400">🗑️ Supprimer à l&apos;enregistrement</p>
                    <button
                      type="button"
                      onClick={() => setRemoveFile(false)}
                      className="text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-300 underline underline-offset-4"
                    >
                      Annuler
                    </button>
                  </div>
                )}

                {/* Champ pour nouveau fichier */}
                {!removeFile && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2 ml-1">
                      {currentFileUrl ? "Remplacer par un nouveau fichier (optionnel) :" : "Ajouter un fichier (optionnel) :"}
                    </p>
                    <input
                      type="file"
                      accept="image/*, video/*, application/pdf"
                      onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                      className="glass-input w-full file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 cursor-pointer"
                    />
                    {newFile && (
                      <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mt-3 ml-1 flex items-center gap-2">
                        <span>✅ Sélectionné :</span> <span className="text-slate-400">{newFile.name}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="pt-6 space-y-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`neuron-btn w-full flex items-center justify-center gap-3 transition-all ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Mise à jour en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">💾</span>
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full mt-2 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-cyan-400 transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Annuler et revenir
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditArticle;
