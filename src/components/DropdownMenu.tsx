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
          className="glass-input inline-flex justify-center items-center w-full !px-5 !py-2.5 text-sm font-black uppercase tracking-widest text-white hover:border-cyan-400"
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
        <div className="glass-card absolute right-0 mt-3 w-56 !rounded-2xl !bg-slate-900/95 overflow-hidden z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50">
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
                className="block w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400 text-left transition-all"
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
