import React, { useState } from "react";
import { db } from "../api/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../api/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NewArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const articlesRef = collection(db, "articles");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let fileURL = "";
      if (file) {
        // Générer un nom de fichier unique pour éviter les conflits
        const uniqueFileName = `${Date.now()}-${file.name}`;

        // Créer une référence à l'emplacement du fichier dans Firebase Storage
        const storageRef = ref(storage, `files/${uniqueFileName}`);

        // Téléverser le fichier
        await uploadBytes(storageRef, file);

        // Obtenir l'URL de téléchargement du fichier
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
      setTitle("");
      setContent("");
      setTheme("");
      setFile(null);
    } catch (err) {
      setError("Failed to create article");
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen  ">
      <Navbar />
      <main className="flex-grow my-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center my-8">
            Créer un nouvel article
          </h1>
          {error && (
            <div className="bg-red-500 text-white p-4 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Titre
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Thème
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Contenu
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="shadow appearance-none border rounded w-full h-80  py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Ajouter un fichier
              </label>
              <input
                type="file"
                accept="image/*, video/*, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

           
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isLoading ? "En cours..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewArticle;
