import React from "react";
import Image from "next/image";

interface FileDisplayProps {
  file: string;
  fileType: string;
  title: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ file, fileType, title }) => {
  const content = () => {
    if (fileType.startsWith("image")) {
      return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 group">
          <Image
            src={file}
            alt={title}
            width={800}
            height={600}
            quality={100}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              🔍 Cliquez pour ouvrir
            </span>
          </div>
        </div>
      );
    } else if (fileType.startsWith("video")) {
      return (
        <video width="100%" height="auto" controls className="rounded-xl shadow-sm border border-slate-200">
          <source src={file} type={fileType} />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      );
    } else if (fileType === "application/pdf") {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 border-dashed text-center">
            <span className="text-4xl mb-4 block">📄</span>
            <p className="font-bold text-slate-700 mb-2">Document PDF</p>
            <p className="text-sm text-slate-500 mb-4">Cliquez sur le bouton ci-dessous pour voir le contenu complet.</p>
          </div>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="neuron-btn inline-flex items-center justify-center gap-2 text-center"
          >
            Ouvrir le PDF dans un nouvel onglet
          </a>
        </div>
      );
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="p-6 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-4 hover:bg-teal-100 transition-colors"
        >
          <span className="text-3xl">📝</span>
          <div>
            <p className="font-bold text-teal-800 text-lg">Document Word</p>
            <p className="text-sm text-teal-600">Cliquez pour télécharger ou voir</p>
          </div>
        </a>
      );
    } else {
      return (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
          <span className="text-slate-600 font-medium italic">Type de fichier non pris en charge ({fileType})</span>
          <a href={file} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold underline">
            Forcer l&apos;ouverture
          </a>
        </div>
      );
    }
  };

  return (
    <div className="cursor-pointer" onClick={() => !fileType.startsWith("video") && window.open(file, "_blank")}>
      {content()}
    </div>
  );
};

export default FileDisplay;
