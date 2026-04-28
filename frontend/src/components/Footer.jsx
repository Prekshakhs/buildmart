// Footer.jsx
export function Footer() {
  return (
    <footer className="bg-steel-950 border-t border-steel-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center">
                <span className="font-display font-800 text-steel-950 text-xs">BM</span>
              </div>
              <span className="font-display font-700 text-lg uppercase tracking-widest text-steel-50">
                Build<span className="text-amber-400">Mart</span>
              </span>
            </div>
            <p className="text-steel-400 text-sm font-body leading-relaxed">
              India's trusted B2B marketplace for construction, hardware &amp; agriculture.
            </p>
          </div>
          {[
            { title: "Browse", links: ["Construction Materials", "Hardware Tools", "Plumbing & Electrical", "Agriculture Equipment"] },
            { title: "Account", links: ["Register", "Login", "My Orders", "Sell on BuildMart"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Returns Policy", "Bulk Orders"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-display font-700 text-xs uppercase tracking-widest text-steel-400 mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}><a href="#" className="text-steel-500 hover:text-steel-200 text-sm font-body transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-steel-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-steel-600 text-xs font-mono">© {new Date().getFullYear()} BuildMart. All rights reserved.</p>
          <p className="text-steel-700 text-xs font-mono">Built with MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
