// CustomButton.tsx
import React from "react";

interface CustomButtonProps {
  bgColor: string;
  textColor: string;
  text: string;
  mobileText?: string;
  type: "button" | "submit";
  onClick: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  bgColor,
  textColor,
  text,
  mobileText,
  type,
  onClick,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIfMobile = () => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(isMobile);
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <button
      type={type}
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`font-bold py-1 md:px-4 px-2 rounded ml-2 ${
        isMobile ? "text-lg " : ""
      }`}
      onClick={onClick}
    >
      {isMobile && mobileText ? mobileText : text}
    </button>
  );
};

export default CustomButton;
