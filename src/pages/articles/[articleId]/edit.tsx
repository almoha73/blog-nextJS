// pages/articles/[articleId]/edit.tsx
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { db } from "../../api/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Article } from "../../../types/type";
import autosize from "autosize";
import CustomButton from "@/components/CustomButton";

const EditArticle = ({ article }: { article: Article }) => {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title);
  const [theme, setTheme] = useState(article?.theme);
  const [content, setContent] = useState(article?.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "articles", article.id), {
        theme: theme,
        title: title,
        content: content,
      });
      setIsUpdated(true);
    } catch (error) {
      console.error("Failed to update the article:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Redirection vers la page de l'article une fois l'article modifié
  useEffect(() => {
    if (isUpdated) {
      router.push(`/articles/${article.id}`);
    }
  }, [isUpdated, router, article]);
  // Appel de la fonction autosize sur le textarea
  useEffect(() => {
    autosize(document.getElementById("content") as HTMLTextAreaElement);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex justify-between items-center mb-6 mx-2">
            <h1 className="lg:text-3xl font-bold text-white">
              Modifier l&apos;article
            </h1>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="mb-4">
              <label
                htmlFor="theme"
                className="block text-sm font-medium text-gray-700"
              >
                Thème
              </label>
              <input
                type="text"
                name="theme"
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 p-2 border"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Titre
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 p-2 border"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Contenu
              </label>
              <textarea
                name="content"
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 p-2 border"
              ></textarea>
            </div>
            <CustomButton
              bgColor="#BD99A0"
              textColor="white"
              text="Enregistrer"
              type="submit"
              onClick={handleUpdate}
            />
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditArticle;

export async function getServerSideProps(context: any) {
  const articleId = context.query.articleId;

  const docRef = doc(db, "articles", articleId);
  const docSnap = await getDoc(docRef);

  let article: Article | null = null;

  if (docSnap.exists()) {
    article = {
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
      article,
    },
  };
}
