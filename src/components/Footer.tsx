import React from 'react'

const Footer = () => {
  return (
    <footer className="glass-card !rounded-none !border-b-0 !border-x-0 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-center text-slate-500 font-medium tracking-tight">
          © {new Date().getFullYear()} BrainBlog. Créé avec passion pour les idées en mouvement.
        </p>
      </div>
    </footer>
  );
};

export default Footer;