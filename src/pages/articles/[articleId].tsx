import React from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Article } from "../../types/type";
import { db } from "../api/firebase";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import "highlight.js/styles/default.css";
import { useEffect, useState, useRef } from "react";
import FileDisplay from "@/components/FileDisplay";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/cjs/languages/hljs/javascript";
import xml from "react-syntax-highlighter/dist/cjs/languages/hljs/xml";
import css from "react-syntax-highlighter/dist/cjs/languages/hljs/css";
import ArticleCard from "@/components/ArticleCard";
import CustomButton from "@/components/CustomButton";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("xml", xml);
SyntaxHighlighter.registerLanguage("css", css);

interface ArticleDetailProps {
  articles: Article;
}

const ArticleDetail = ({ articles }: ArticleDetailProps) => {
  // Utilisez cet ID pour afficher les détails de l'article correspondant
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      await deleteDoc(doc(db, "articles", articles.id));
      router.push("/");
    }
  };

  const handleEdit = () => {
    router.push(`/articles/${articles.id}/edit`);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 ">
        <div className="max-w-4xl mx-auto py-6">
          <div className="flex justify-between items-center mb-6 mx-2 border p-2 bg-white">
            <div className="lg:text-3xl font-bold break-words">
              <div className=" mr-2 p-1 mb-2">
                <span className="bg-[#A7EDD6] mr-2 px-2">Thème</span>
                {articles && articles.theme}
              </div>
              <div className=" mr-2 p-1 ">
                <span className="bg-[#F8E1C7] mr-2 px-2">Titre</span>
                {articles && articles.title}
              </div>
            </div>
            <div className="flex">
              <CustomButton
                bgColor="#82E4D0"
                textColor="white"
                text="Edit"
                mobileText="✎"
                type="button"
                onClick={handleEdit}
              />
              <CustomButton
                bgColor="#BD99A0"
                textColor="white"
                text="Supprimer"
                mobileText="✕"
                type="button"
                onClick={handleDelete}
              />
            </div>
          </div>
          {!articles ? (
            <p>Chargement...</p>
          ) : (
            articles && <ArticleCard article={articles} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;

export async function getServerSideProps(context: any) {
  const articleId = context.query.articleId;

  const docRef = doc(db, "articles", articleId);
  const docSnap = await getDoc(docRef);

  let articles: Article | null = null;

  if (docSnap.exists()) {
    articles = {
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
      articles,
    },
  };
}
