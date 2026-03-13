import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import LeafletMap from "@/components/LeafletMap";
import { Vehicle } from "@/types/pearl-hub";

const VehiclesPage = () => {
  const { data, showToast } = useAppContext();
  const [filter, setFilter] = useState({ type: "all", driver: "all", location: "" });
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ startDate: "", endDate: "", driver: "no" });

  const vehicleTypes = [{ id: "all", label: "All" }, { id: "car", label: "Cars" }, { id: "van", label: "Vans" }, { id: "jeep", label: "Jeeps" }, { id: "bus", label: "Buses" }, { id: "luxury_coach", label: "Luxury Coach" }];

  const filtered = data.vehicles.filter(v => {
    if (filter.type !== "all" && v.type !== filter.type) return false;
    if (filter.driver !== "all" && v.driver !== filter.driver) return false;
    if (filter.location && !v.location.toLowerCase().includes(filter.location.toLowerCase())) return false;
    return true;
  });

  const mapMarkers = filtered.map(v => ({ lat: v.lat, lng: v.lng, title: `${v.make} ${v.model}`, location: v.location, price: v.price, emoji: v.image, type: "vehicle" as const }));

  const days = form.startDate && form.endDate ? Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-ruby to-ruby/70 py-10">
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🚗 Vehicle Rental</div>
            <h1 className="text-pearl text-3xl">Rent a Vehicle</h1>
            <p className="text-pearl/75 mt-1.5">Cars • Vans • Jeeps • Buses • Luxury Coaches</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg px-5 py-3.5">
            <div className="text-[11px] text-pearl/60 uppercase tracking-wider">Listing Fee</div>
            <div className="text-2xl font-bold text-primary">Rs. 6,500</div>
            <div className="text-[11px] text-pearl/60">per vehicle / month</div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 items-center flex-wrap">
          {vehicleTypes.map(t => (
            <button key={t.id} onClick={() => setFilter({...filter, type: t.id})}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter.type === t.id ? "bg-ruby text-pearl border-ruby" : "bg-transparent text-muted-foreground border-input"}`}>{t.label}</button>
          ))}
          <div className="ml-auto flex gap-2">
            <select value={filter.driver} onChange={e => setFilter({...filter, driver: e.target.value})} className="rounded-md border border-input px-3 py-1.5 text-sm bg-card w-auto">
              <option value="all">With / Without Driver</option><option value="included">Driver Included</option><option value="optional">Self Drive</option>
            </select>
            <button onClick={() => setViewMode(viewMode === "grid" ? "map" : "grid")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${viewMode === "map" ? "bg-ruby text-pearl border-ruby" : "bg-transparent text-muted-foreground border-input"}`}>
              {viewMode === "map" ? "⊞ Grid" : "🗺️ Map"}
            </button>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {viewMode === "map" ? (
          <LeafletMap markers={mapMarkers} center={[7.8731, 80.7718]} zoom={8} height="500px" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(v => (
              <div key={v.id} onClick={() => { setSelected(v); setForm({ startDate: "", endDate: "", driver: v.driver === "included" ? "yes" : "no" }); }}
                className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border border-border">
                <div className="h-36 bg-gradient-to-br from-ruby/10 to-ruby/[0.03] flex items-center justify-center text-5xl relative">
                  {v.image}
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-ruby/10 text-ruby capitalize">{v.type.replace("_", " ")}</span>
                  <span className={`absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${v.driver === "included" ? "bg-emerald/10 text-emerald" : "bg-pearl-dark text-muted-foreground"}`}>
                    {v.driver === "included" ? "Driver Included" : "Self Drive"}
                  </span>
                </div>
                <div className="p-4">
                  <div className="font-display text-lg font-bold mb-1">{v.make} {v.model}</div>
                  <div className="flex gap-3 text-[13px] text-muted-foreground mb-3">
                    <span>🗓 {v.year}</span><span>👥 {v.seats} seats</span><span>⛽ {v.fuel}</span>{v.ac && <span>❄️ A/C</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <div><span className="font-display text-xl font-bold text-ruby">Rs. {v.price.toLocaleString()}</span><span className="text-xs text-muted-foreground">/{v.priceUnit}</span></div>
                    <div className="flex gap-2.5 text-xs text-muted-foreground"><span>★ {v.rating}</span><span>📍 {v.location}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-ruby to-ruby/70 px-7 py-6 flex justify-between">
              <div>
                <h2 className="text-pearl text-xl mb-1">{selected.image} {selected.make} {selected.model}</h2>
                <p className="text-pearl/70 text-sm">📍 {selected.location} • {selected.year} • {selected.seats} seats • ★ {selected.rating}</p>
              </div>
              <button onClick={() => setSelected(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer">✕</button>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className="block text-xs font-semibold mb-1">Pickup Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} min={new Date().toISOString().split("T")[0]} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Return Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} min={form.startDate} className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
              </div>
              {days > 0 && (
                <div className="bg-background rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-[13px] mb-1.5"><span>Rs. {selected.price.toLocaleString()} × {days} days</span><span>Rs. {(selected.price * days).toLocaleString()}</span></div>
                  {form.driver === "yes" && selected.driver !== "included" && <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Driver (Rs. 3,500/day × {days})</span><span>Rs. {(3500 * days).toLocaleString()}</span></div>}
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-ruby">Rs. {((selected.price * days) + (form.driver === "yes" && selected.driver !== "included" ? 3500 * days : 0)).toLocaleString()}</span></div>
                </div>
              )}
              <button onClick={() => { if (!form.startDate || !form.endDate) { showToast("Please select dates.", "error"); return; } showToast("Vehicle booked successfully!", "success"); setSelected(null); }}
                className="w-full bg-ruby hover:bg-ruby-light text-pearl py-3 rounded-lg font-bold transition-all">🚗 Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
