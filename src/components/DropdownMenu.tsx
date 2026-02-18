import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

type Option = { label: string; value: any };

interface DropdownMenuProps {
  options: Option[];
  onSelect: (option: any) => void; // Définir la fonction de rappel onSelect
}

const DropdownMenu = ({ options, onSelect }: DropdownMenuProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options && options.length ? options[0] : null
  );
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function handleOptionClick(option: Option) {
    setSelectedOption(option);
    onSelect(option.value); // Appeler la fonction de rappel onSelect avec la valeur de l'option sélectionnée
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="glass-input inline-flex justify-center items-center w-full !px-5 !py-2.5 text-sm font-bold text-slate-700 hover:bg-white/80"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? selectedOption.label : ""}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 opacity-50" aria-hidden="true" />
        </button>
      </div>
      {isOpen && (
        <div className="glass-card absolute right-0 mt-3 w-56 !rounded-xl !bg-white overflow-hidden z-[100] shadow-2xl border border-slate-200">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="block w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 text-left transition-colors"
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
