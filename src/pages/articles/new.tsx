import React, { useState } from "react";
import { db } from "../api/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/router";

const NewArticle = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let fileURL = "";
      if (file) {
        const uniqueFileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `files/${uniqueFileName}`);
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
      }

      const articlesCollection = collection(db, "articles");
      await addDoc(articlesCollection, {
        title,
        content,
        theme,
        file: fileURL,
        fileType: file?.type || "",
        createdAt: serverTimestamp(),
      });

      // Success! Redirect to home
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("permission-denied")) {
        setError("Erreur de permission Firebase : Vérifiez vos règles de sécurité Firestore.");
      } else {
        setError("Impossible de créer le neurone. Erreur : " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="glass-card p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-coral-500 mb-2">
                🧠 Nouveau Neurone
              </h1>
              <p className="text-slate-500 font-medium">Ajoutez une nouvelle connexion à votre savoir.</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-pulse">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-700 font-bold mb-2 ml-1">Titre de la pensée</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Les secrets de la physique quantique"
                  className="glass-input w-full font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 ml-1">Thème / Catégorie</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Science, Design, Cuisine..."
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 ml-1">Exploration (Contenu)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Développez votre idée ici..."
                  className="glass-input w-full h-64 resize-none leading-relaxed"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2 ml-1">Pièce jointe (Image, PDF...)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*, video/*, application/pdf"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="glass-input w-full file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`neuron-btn w-full flex items-center justify-center gap-3 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⚡</span>
                      <span>Enregistrer le neurone</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Annuler et revenir en arrière
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

export default NewArticle;
