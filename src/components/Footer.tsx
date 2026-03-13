import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-obsidian pt-10 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-gold-dark rounded-full flex items-center justify-center text-base">💎</div>
              <div>
                <div className="font-display font-bold text-lg text-pearl">Pearl Hub</div>
                <div className="text-[9px] text-primary tracking-[2px]">SRI LANKA</div>
              </div>
            </div>
            <p className="text-[13px] text-fog leading-relaxed max-w-[260px]">
              Sri Lanka's premier multi-domain marketplace platform connecting customers with the island's finest properties, stays, vehicles, and events.
            </p>
          </div>
          {[
            { title: "Services", links: [{ label: "Property Listings", path: "/property" }, { label: "Stays & Hotels", path: "/stays" }, { label: "Vehicle Rental", path: "/vehicles" }, { label: "Event Booking", path: "/events" }] },
            { title: "For Business", links: [{ label: "Owner Listing", path: "/dashboard" }, { label: "Broker Membership", path: "/dashboard" }, { label: "Stay Providers", path: "/dashboard" }, { label: "Event Organizers", path: "/dashboard" }] },
            { title: "Company", links: [{ label: "About Us", path: "/about" }, { label: "Contact Us", path: "/contact" }, { label: "Terms & Conditions", path: "/settings" }, { label: "Privacy Policy", path: "/settings" }] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-[13px] font-bold text-pearl mb-3 uppercase tracking-wider">{col.title}</div>
              {col.links.map(link => (
                <div key={link.label} onClick={() => navigate(link.path)} className="text-[13px] text-fog mb-2 cursor-pointer hover:text-primary transition-colors">{link.label}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.08] pt-5 flex justify-between items-center flex-wrap gap-3">
          <div className="text-xs text-mist">© 2024 Pearl Hub Platform (Pvt) Ltd. Registered in Sri Lanka.</div>
          <div className="text-xs text-mist">🇱🇰 Made with ❤️ for Sri Lanka</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
