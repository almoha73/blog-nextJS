import React from 'react'

const Footer = () => {
  return (
    <footer className="glass-card !rounded-none !border-b-0 !border-x-0 py-12 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-2">
          © {new Date().getFullYear()} BrainBlog
        </p>
        <p className="text-slate-600 font-bold text-xs">
          Propulsé par l'imagination et les connexions neuronales.
        </p>
      </div>
    </footer>
  );
};

export default Footer;