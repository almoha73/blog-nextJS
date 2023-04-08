import React from "react";
import Image from "next/image";

interface FileDisplayProps {
  file: string;
  fileType: string;
  title: string;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ file, fileType, title }) => {
  if (fileType.startsWith("image")) {
    return (
      <Image
        src={file}
        alt={title}
        width={400}
        height={400}
        quality={100}
        className="w-40 h-40"
        style={{ objectFit: "cover" }}
      />
    );
  } else if (fileType.startsWith("video")) {
    return (
      <video width="320" height="240" controls>
        <source src={file} type={fileType} />
        Your browser does not support the video tag.
      </video>
    );
  } else if (fileType === "application/pdf") {
    return (
      <embed src={file} type="application/pdf" width="100%" height="600px" />
    );
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return (
      <a href={file} target="_blank" rel="noopener noreferrer">
        Télécharger le document Word
      </a>
    );
  } else {
    return <p>Type de fichier non pris en charge</p>;
  }
};

export default FileDisplay;
