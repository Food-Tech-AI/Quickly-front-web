'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    {
      title: 'Produit',
      links: [
        { label: 'Fonctionnalités', href: '#features' },
        { label: 'Recettes', href: '/recipe' },
        { label: 'Planification', href: '#how-it-works' },
        { label: 'Panier de Courses', href: '#grocery-shopping' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À Propos', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carrières', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { label: 'Confidentialité', href: '/privacy' },
        { label: "Conditions d'Utilisation", href: '#' },
        { label: 'Cookies', href: '#' },
        { label: 'RGPD', href: '#' },
      ],
    },
  ];

  const socials = [
    { icon: '📷', label: 'Instagram' },
    { icon: '🐦', label: 'Twitter' },
    { icon: '📘', label: 'Facebook' },
    { icon: '🎬', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#0F1A2E] text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <motion.div
          className="grid md:grid-cols-5 gap-12 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">Q</span>
              </div>
              <h3 className="text-xl font-black">E-Quickly</h3>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-6">
              Transformez votre façon de découvrir, sauvegarder et cuisiner des recettes provenant des réseaux sociaux.
            </p>
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/[0.06] hover:bg-primary/20 rounded-xl flex items-center justify-center text-white/50 hover:text-primary transition-all duration-200 text-base hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {linkGroups.map((group, i) => (
            <div key={i}>
              <h4 className="font-bold mb-5 text-white/80 text-xs uppercase tracking-[0.15em]">{group.title}</h4>
              <ul className="space-y-3 text-sm">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-white/40 hover:text-primary transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider & Bottom */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-sm">
            © {currentYear} E-Quickly. Tous droits réservés.
          </p>
          <p className="text-white/20 text-xs">
            Fait avec 💚 pour les passionnés de cuisine
          </p>
        </div>
      </div>
    </footer>
  );
}

