import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import LeafletMap from "@/components/LeafletMap";
import { Property } from "@/types/pearl-hub";

const formatPrice = (p: number) => p >= 1000000 ? `Rs. ${(p / 1000000).toFixed(1)}M` : `Rs. ${p.toLocaleString()}`;

const PropertyPage = () => {
  const { data, currentUser, showToast, favorites, toggleFavorite } = useAppContext();
  const [filter, setFilter] = useState({ type: "all", minPrice: "", maxPrice: "", beds: "all", location: "" });
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);

  const filtered = data.properties.filter(p => {
    if (filter.type !== "all" && p.type !== filter.type) return false;
    if (filter.minPrice && p.price < parseInt(filter.minPrice)) return false;
    if (filter.maxPrice && p.price > parseInt(filter.maxPrice)) return false;
    if (filter.beds !== "all" && p.beds < parseInt(filter.beds)) return false;
    if (filter.location && !p.location.toLowerCase().includes(filter.location.toLowerCase())) return false;
    return true;
  });

  const mapMarkers = filtered.map(p => ({ lat: p.lat, lng: p.lng, title: p.title, location: p.location, price: p.price, emoji: p.image, type: "property" }));
  const typeColorMap: Record<string, string> = { sale: "bg-emerald/10 text-emerald", rent: "bg-sapphire/10 text-sapphire", lease: "bg-primary/10 text-gold-dark" };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald to-emerald/70 py-10">
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🏘️ Property Marketplace</div>
              <h1 className="text-pearl text-3xl">Find Your Perfect Property</h1>
              <p className="text-pearl/75 mt-1.5">Sales • Rentals • Leases across Sri Lanka</p>
            </div>
            {(currentUser === "owner" || currentUser === "broker") && (
              <button onClick={() => setShowListingModal(true)} className="bg-primary hover:bg-gold-light text-primary-foreground px-7 py-3 rounded-lg font-bold transition-all">➕ List Property</button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border-b border-border py-4">
        <div className="container flex gap-3 items-center flex-wrap">
          <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="rounded-md border border-input px-3 py-2 text-sm bg-card w-auto">
            <option value="all">All Types</option><option value="sale">For Sale</option><option value="rent">For Rent</option><option value="lease">For Lease</option>
          </select>
          <input value={filter.location} onChange={e => setFilter({...filter, location: e.target.value})} placeholder="🔍 Location" className="rounded-md border border-input px-3 py-2 text-sm w-44" />
          <input value={filter.minPrice} onChange={e => setFilter({...filter, minPrice: e.target.value})} placeholder="Min Price" className="rounded-md border border-input px-3 py-2 text-sm w-28" type="number" />
          <input value={filter.maxPrice} onChange={e => setFilter({...filter, maxPrice: e.target.value})} placeholder="Max Price" className="rounded-md border border-input px-3 py-2 text-sm w-28" type="number" />
          <select value={filter.beds} onChange={e => setFilter({...filter, beds: e.target.value})} className="rounded-md border border-input px-3 py-2 text-sm bg-card w-auto">
            <option value="all">Any Beds</option><option value="1">1+ Beds</option><option value="2">2+ Beds</option><option value="3">3+ Beds</option><option value="4">4+ Beds</option>
          </select>
          <div className="ml-auto flex gap-1">
            {(["grid","list","map"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold border transition-all capitalize ${viewMode === m ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input"}`}>
                {m === "grid" ? "⊞" : m === "list" ? "☰" : "🗺️"} {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10">
        {/* Pricing banner */}
        <div className="bg-gradient-to-r from-primary/[0.08] to-emerald/[0.08] border border-primary/20 rounded-lg px-5 py-3.5 mb-6 flex gap-6 flex-wrap items-center text-[13px]">
          <div><strong className="text-primary">Owner Listing:</strong> <span className="text-muted-foreground">Rs. 1,000 per property + 2% sale commission</span></div>
          <div className="w-px h-5 bg-border" />
          <div><strong className="text-sapphire">Broker Membership:</strong> <span className="text-muted-foreground">Rs. 23,000/mo – 65 listings</span></div>
          <div className="w-px h-5 bg-border" />
          <div><strong className="text-emerald">Buyer Discount:</strong> <span className="text-muted-foreground">0.5% off via seller promo code</span></div>
        </div>

        {viewMode === "map" ? (
          <LeafletMap markers={mapMarkers} center={[7.8731, 80.7718]} zoom={8} height="550px" />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
            {filtered.map(prop => (
              <div key={prop.id} onClick={() => setSelectedProp(prop)} className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                {viewMode === "grid" ? (
                  <>
                    <div className="h-44 bg-gradient-to-br from-emerald/10 to-emerald/[0.03] flex items-center justify-center text-6xl relative">
                      {prop.image}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${typeColorMap[prop.type]}`}>{prop.type === "sale" ? "For Sale" : prop.type === "rent" ? "For Rent" : "For Lease"}</span>
                        {prop.owner === "owner" && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-gold-dark">🎁 Promo</span>}
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleFavorite(prop.id); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 flex items-center justify-center text-sm border-none cursor-pointer">
                        {favorites.includes(prop.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="font-display text-base font-bold mb-1 leading-tight">{prop.title}</div>
                      <div className="text-[13px] text-muted-foreground mb-3">📍 {prop.location}</div>
                      <div className="flex gap-4 mb-3">
                        {prop.beds > 0 && <span className="text-xs text-muted-foreground">🛏 {prop.beds}</span>}
                        {prop.baths > 0 && <span className="text-xs text-muted-foreground">🚿 {prop.baths}</span>}
                        <span className="text-xs text-muted-foreground">📐 {prop.area.toLocaleString()} sq.ft</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="font-display text-lg font-bold text-emerald">{formatPrice(prop.price)}</div>
                          {prop.type === "rent" && <div className="text-[11px] text-muted-foreground">/ month</div>}
                        </div>
                        <span className="text-[11px] text-muted-foreground">👁 {prop.views}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex">
                    <div className="w-24 bg-background flex items-center justify-center text-4xl flex-shrink-0">{prop.image}</div>
                    <div className="p-4 flex-1 flex items-center gap-5 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase mr-2 ${typeColorMap[prop.type]}`}>{prop.type}</span>
                        <div className="font-display text-base font-bold mt-1">{prop.title}</div>
                        <div className="text-[13px] text-muted-foreground">📍 {prop.location}</div>
                      </div>
                      <div className="font-display text-xl font-bold text-emerald">{formatPrice(prop.price)}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-3">🏘️</div>
            <h3>No properties found</h3>
            <p className="mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProp && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setSelectedProp(null)}>
          <div className="bg-card rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-emerald to-emerald/70 px-7 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-pearl text-xl mb-1">{selectedProp.image} {selectedProp.title}</h2>
                <p className="text-pearl/75 text-sm">📍 {selectedProp.location} • {selectedProp.subtype}</p>
              </div>
              <button onClick={() => setSelectedProp(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer text-lg">✕</button>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Price", value: `Rs. ${selectedProp.price.toLocaleString()}${selectedProp.type === "rent" ? "/mo" : ""}` },
                  { label: "Type", value: selectedProp.type.charAt(0).toUpperCase() + selectedProp.type.slice(1) },
                  ...(selectedProp.beds > 0 ? [{ label: "Bedrooms", value: String(selectedProp.beds) }] : []),
                  ...(selectedProp.baths > 0 ? [{ label: "Bathrooms", value: String(selectedProp.baths) }] : []),
                  { label: "Area", value: `${selectedProp.area.toLocaleString()} sq.ft` },
                  { label: "Listed By", value: selectedProp.owner === "owner" ? "Direct Owner" : "Licensed Broker" },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-background rounded-lg">
                    <div className="text-xs text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="font-bold text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedProp.description}</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {selectedProp.amenities?.map(a => <span key={a} className="inline-block px-2 py-0.5 bg-pearl-dark rounded text-[11px] font-medium text-muted-foreground">{a}</span>)}
              </div>
              <LeafletMap markers={[{ lat: selectedProp.lat, lng: selectedProp.lng, title: selectedProp.title, location: selectedProp.location, price: selectedProp.price, emoji: selectedProp.image, type: "property" }]} center={[selectedProp.lat, selectedProp.lng]} zoom={14} height="250px" />
              {currentUser === "customer" && (
                <div className="flex gap-2.5 mt-5">
                  <button onClick={() => { showToast("Enquiry sent! The owner/broker will contact you shortly.", "success"); setSelectedProp(null); }}
                    className="flex-1 bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">📞 Enquire Now</button>
                  <button onClick={() => toggleFavorite(selectedProp.id)}
                    className="px-6 py-3 rounded-lg font-bold border border-input bg-card hover:bg-background transition-all">
                    {favorites.includes(selectedProp.id) ? "❤️ Saved" : "🤍 Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setShowListingModal(false)}>
          <div className="bg-card rounded-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-sapphire to-sapphire/70 px-7 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-pearl text-xl mb-1">{currentUser === "owner" ? "🏠 List as Owner" : "🏢 List as Broker"}</h2>
                <p className="text-pearl/75 text-sm">{currentUser === "owner" ? "Rs. 1,000 per listing" : "Rs. 23,000/mo membership"}</p>
              </div>
              <button onClick={() => setShowListingModal(false)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer text-lg">✕</button>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="block text-xs font-semibold mb-1">Listing Type</label>
                  <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>For Sale</option><option>For Rent</option><option>For Lease</option></select>
                </div>
                <div><label className="block text-xs font-semibold mb-1">Category</label>
                  <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>House</option><option>Apartment</option><option>Villa</option><option>Land</option><option>Commercial</option></select>
                </div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Property Title *</label>
                <input placeholder="e.g. Luxury Villa in Colombo 7" className="w-full rounded-md border border-input px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Price (Rs.) *</label><input type="number" placeholder="e.g. 15000000" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Location *</label><input placeholder="e.g. Colombo 07" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Bedrooms</label><input type="number" defaultValue={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Bathrooms</label><input type="number" defaultValue={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Area (sq.ft)</label><input type="number" className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              <div className="mb-4"><label className="block text-xs font-semibold mb-1">Description</label>
                <textarea rows={3} placeholder="Describe the property…" className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" />
              </div>
              <button onClick={() => { showToast("Property listed successfully!", "success"); setShowListingModal(false); }}
                className="w-full bg-emerald hover:bg-emerald-light text-accent-foreground py-3 rounded-lg font-bold transition-all">🚀 Submit Listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyPage;
