'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-primary">Quickly</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Transforming how you discover, save, and cook recipes from social media.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Recipes</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Meal Planning</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Grocery Cart</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-primary transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            © {currentYear} Quickly. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-white/70 hover:text-primary transition-colors text-2xl">
              📷
            </a>
            <a href="#" className="text-white/70 hover:text-primary transition-colors text-2xl">
              🐦
            </a>
            <a href="#" className="text-white/70 hover:text-primary transition-colors text-2xl">
              📘
            </a>
            <a href="#" className="text-white/70 hover:text-primary transition-colors text-2xl">
              🎬
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

