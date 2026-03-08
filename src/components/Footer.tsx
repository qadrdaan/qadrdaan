const Footer = () => (
  <footer className="bg-primary py-16 border-t border-gold/10">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">Qadrdaan</h3>
          <p className="font-body text-sm text-primary-foreground/50 leading-relaxed">
            The world's largest digital stage for poetry, literature, and mushaira culture.
          </p>
        </div>
        {[
          { title: "Platform", links: ["Browse Poets", "Mushaira Events", "Book Store", "Competitions"] },
          { title: "Creators", links: ["Start Publishing", "Creator Dashboard", "Verification", "Promotions"] },
          { title: "Company", links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-body text-sm font-semibold text-gold uppercase tracking-wider mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-primary-foreground/50 hover:text-gold transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-8 border-t border-gold/10 text-center">
        <p className="font-body text-xs text-primary-foreground/30">
          © 2026 Qadrdaan. All rights reserved. Built for poets, by poetry lovers.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
