import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { PearlEvent } from "@/types/pearl-hub";

const EventsPage = () => {
  const { data, showToast } = useAppContext();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<PearlEvent | null>(null);
  const [ticketType, setTicketType] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [step, setStep] = useState(1);

  const eventCategories = [{ id: "all", label: "All Events" }, { id: "cinema", label: "🎬 Cinema" }, { id: "concert", label: "🎵 Concerts" }, { id: "sports", label: "🏏 Sports" }];

  const filtered = data.events.filter(e => filter === "all" || e.category === filter);

  const toggleSeat = (idx: number) => {
    if (!selected || selected.seats.booked.includes(idx)) return;
    setSelectedSeats(prev => prev.includes(idx) ? prev.filter(s => s !== idx) : prev.length < quantity ? [...prev, idx] : prev);
  };

  const price = selected ? selected.prices[ticketType] || 0 : 0;
  const tax = price * 0.15;
  const grandTotal = (price + tax) * (selectedSeats.length || quantity);

  return (
    <div className="min-h-screen bg-background">
      <div className="py-10" style={{ background: "linear-gradient(135deg, hsl(256 57% 29%), hsl(256 57% 12%))" }}>
        <div className="container">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🎭 Events & Entertainment</div>
          <h1 className="text-pearl text-3xl">Discover Events</h1>
          <p className="text-pearl/75 mt-1.5">Cinema • Concerts • Sports • QR-Coded Tickets</p>
        </div>
      </div>

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 flex-wrap">
          {eventCategories.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${filter === c.id ? "text-pearl border-indigo" : "bg-transparent text-muted-foreground border-input"}`}
              style={filter === c.id ? { background: "hsl(256 57% 29%)" } : {}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(evt => (
            <div key={evt.id} onClick={() => { setSelected(evt); setStep(1); setSelectedSeats([]); setQuantity(1); setTicketType("standard"); }}
              className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-border flex">
              <div className="w-28 flex items-center justify-center text-5xl flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(256 57% 29% / 0.1), transparent)" }}>{evt.image}</div>
              <div className="p-4 flex-1">
                <div className="flex gap-1.5 mb-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sapphire/10 text-sapphire capitalize">{evt.category}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-gold-dark">🎫 {evt.availableSeats} left</span>
                </div>
                <div className="font-display text-base font-bold mb-1">{evt.title}</div>
                <div className="text-[13px] text-muted-foreground mb-1">🏛 {evt.venue}</div>
                <div className="text-[13px] text-muted-foreground mb-2.5">📅 {evt.date} • ⏰ {evt.time}</div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-muted-foreground">from </span>
                    <span className="font-display text-lg font-bold text-indigo">Rs. {evt.prices.standard.toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-md text-pearl" style={{ background: "hsl(256 57% 29%)" }}>Book Now</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-obsidian/75 z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto fade-up" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-6 flex justify-between" style={{ background: "linear-gradient(135deg, hsl(256 57% 29%), hsl(256 57% 12%))" }}>
              <div>
                <h2 className="text-pearl text-xl mb-1">{selected.image} {selected.title}</h2>
                <p className="text-pearl/70 text-sm">🏛 {selected.venue} • 📅 {selected.date} • ⏰ {selected.time}</p>
              </div>
              <button onClick={() => setSelected(null)} className="bg-white/15 border-none text-pearl w-9 h-9 rounded-full cursor-pointer">✕</button>
            </div>
            <div className="p-7">
              {/* Steps */}
              <div className="flex gap-2 mb-6">
                {["Select Tickets","Choose Seats","Confirm & Pay"].map((s, i) => (
                  <div key={s} className="flex-1 text-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-1 text-xs font-bold ${i + 1 <= step ? "text-pearl" : "bg-pearl-dark text-muted-foreground"}`}
                      style={i + 1 <= step ? { background: "hsl(256 57% 29%)" } : {}}>{i + 1}</div>
                    <div className={`text-[11px] ${i + 1 === step ? "text-indigo font-bold" : "text-muted-foreground"}`}>{s}</div>
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div>
                  <h4 className="mb-4 text-sm">Select Ticket Type & Quantity</h4>
                  <div className="flex flex-col gap-2.5 mb-5">
                    {Object.entries(selected.prices).map(([type, p]) => (
                      <div key={type} onClick={() => setTicketType(type)}
                        className={`p-3.5 border-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${ticketType === type ? "border-indigo bg-indigo/5" : "border-border"}`}>
                        <div>
                          <div className="font-bold capitalize text-sm">{type === "vip" ? "👑 VIP" : type === "premium" ? "⭐ Premium" : "🎫 Standard"}</div>
                          <div className="text-xs text-muted-foreground">{type === "vip" ? "Front rows, exclusive" : type === "premium" ? "Center rows" : "General seating"}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-bold text-indigo">Rs. {p.toLocaleString()}</div>
                          <div className="text-[11px] text-muted-foreground">+ Rs. {Math.round(p * 0.15).toLocaleString()} tax</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <label className="text-sm font-semibold">Tickets:</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg cursor-pointer">−</button>
                      <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-8 h-8 rounded-full border border-input bg-card text-lg cursor-pointer">+</button>
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full text-pearl py-3 rounded-lg font-bold transition-all text-center" style={{ background: "hsl(256 57% 29%)" }}>Select Seats →</button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm">Select {quantity} Seat{quantity > 1 ? "s" : ""}</h4>
                    <span className="text-[13px] text-muted-foreground">{selectedSeats.length}/{quantity} selected</span>
                  </div>
                  {/* Screen */}
                  <div className="text-center mb-5">
                    <div className="h-2 rounded-full max-w-[300px] mx-auto mb-2" style={{ background: "linear-gradient(to bottom, hsl(256 57% 15%), transparent)" }} />
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider">SCREEN</div>
                  </div>
                  <div className="flex flex-col gap-1 items-center max-h-[300px] overflow-y-auto py-2">
                    {Array.from({ length: selected.seats.rows }, (_, r) => (
                      <div key={r} className="flex gap-[3px] items-center">
                        <div className="w-5 text-[10px] text-muted-foreground text-center flex-shrink-0">{String.fromCharCode(65 + r)}</div>
                        {Array.from({ length: selected.seats.cols }, (_, c) => {
                          const idx = r * selected.seats.cols + c;
                          const isBooked = selected.seats.booked.includes(idx);
                          const isSel = selectedSeats.includes(idx);
                          const isVip = r < Math.floor(selected.seats.rows * 0.2);
                          return (
                            <button key={c} onClick={() => toggleSeat(idx)} title={`${String.fromCharCode(65 + r)}${c + 1}`}
                              className={`seat ${isBooked ? "seat-booked" : isSel ? "seat-selected" : isVip ? "seat-vip" : "seat-available"}`}>{c + 1}</button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 justify-center mt-4 flex-wrap">
                    {[["bg-emerald-light","Available"],["bg-primary","Selected"],["bg-sapphire","VIP"],["bg-pearl-dark","Booked"]].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><div className={`w-3.5 h-3 rounded-t ${color}`} />{label}</div>
                    ))}
                  </div>
                  <div className="flex gap-2.5 mt-5">
                    <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg font-semibold border border-input bg-card text-sm">← Back</button>
                    <button onClick={() => { if (selectedSeats.length < quantity) { showToast(`Select ${quantity} seat(s).`, "error"); return; } setStep(3); }}
                      className="flex-1 text-pearl py-2.5 rounded-lg font-bold text-sm" style={{ background: "hsl(256 57% 29%)" }}>Confirm Seats →</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h4 className="mb-4 text-sm">Booking Summary</h4>
                  <div className="bg-background rounded-lg p-5 mb-5">
                    <div className="flex gap-4 flex-wrap mb-4">
                      <div className="flex-1"><div className="text-xs text-muted-foreground">Event</div><div className="font-bold">{selected.title}</div></div>
                      <div><div className="text-xs text-muted-foreground">Date & Time</div><div className="font-bold">{selected.date} {selected.time}</div></div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {selectedSeats.map(s => {
                        const row = String.fromCharCode(65 + Math.floor(s / selected.seats.cols));
                        const col = (s % selected.seats.cols) + 1;
                        return <span key={s} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sapphire/10 text-sapphire">Seat {row}{col}</span>;
                      })}
                    </div>
                    <div className="flex justify-between text-[13px] mb-1.5"><span className="capitalize">{ticketType} × {selectedSeats.length}</span><span>Rs. {(price * selectedSeats.length).toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Entertainment Tax (15%)</span><span>Rs. {Math.round(tax * selectedSeats.length).toLocaleString()}</span></div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span className="text-indigo">Rs. {grandTotal.toLocaleString()}</span></div>
                  </div>
                  <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 mb-5">
                    <div className="w-20 h-20 bg-pearl-dark rounded-lg flex items-center justify-center text-4xl flex-shrink-0">📱</div>
                    <div>
                      <div className="font-bold mb-1 text-sm">QR Ticket System</div>
                      <div className="text-[13px] text-muted-foreground leading-relaxed">QR-coded tickets sent to your email & SMS with tamper-proof verification.</div>
                      <div className="text-[11px] text-primary font-mono mt-1.5">Ticket ID: PH-TKT-{selected.id}-{Date.now()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg font-semibold border border-input bg-card text-sm">← Back</button>
                    <button onClick={() => { showToast("🎫 Tickets booked! QR codes sent to your email.", "success"); setSelected(null); }}
                      className="flex-1 text-pearl py-3 rounded-lg font-bold text-sm" style={{ background: "hsl(256 57% 29%)" }}>💳 Pay Rs. {grandTotal.toLocaleString()}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
