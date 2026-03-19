import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ShareButtons from "@/components/ShareButtons";
import ImageUpload from "@/components/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

interface SocialPost {
  id: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  type: "status" | "listing" | "tourism" | "ad";
  location?: string;
  verified: boolean;
  verifiedLabel?: string;
}

interface BusinessListing {
  id: string;
  name: string;
  category: string;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  featured: boolean;
  fee: string;
}

interface SMEProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  images: string[];
  active: boolean;
  category: string;
}

const MOCK_POSTS: SocialPost[] = [
  { id: "SP1", author: "Kavinda Fernando", avatar: "👨", role: "Local Guide", content: "Just visited the stunning Nine Arches Bridge in Ella! 🌉 A must-see for anyone traveling to the hill country. The morning light is absolutely magical! #SriLankaTourism #Ella", likes: 234, comments: 45, shares: 18, time: "2 hours ago", type: "tourism", location: "Ella, Sri Lanka", verified: true, verifiedLabel: "STB Verified Guide" },
  { id: "SP2", author: "Ceylon Spice Garden", avatar: "🌿", role: "SME Business", content: "🌶️ Fresh organic spices from our garden in Matale! Visit us for authentic Ceylon cinnamon, pepper, and cardamom. Tourist groups welcome with guided tours. Book via Pearl Hub for 10% off!", likes: 89, comments: 12, shares: 7, time: "4 hours ago", type: "listing", location: "Matale", verified: true, verifiedLabel: "Verified Business" },
  { id: "SP3", author: "Amaya Wijesinghe", avatar: "👩", role: "Traveler", content: "Looking for recommendations for the best seafood restaurants in Negombo! Anyone tried the new place near the beach? 🐟", likes: 56, comments: 23, shares: 2, time: "6 hours ago", type: "status", location: "Negombo", verified: false },
  { id: "SP4", author: "Visit Sigiriya", avatar: "🏰", role: "Tourism Board", content: "📣 Special entry rates for locals this weekend! Bring your NIC and get 50% off entrance fees to Sigiriya Rock Fortress. Share the pride of our heritage! 🇱🇰", likes: 567, comments: 89, shares: 234, time: "8 hours ago", type: "ad", location: "Sigiriya", verified: true, verifiedLabel: "Official Tourism Board" },
  { id: "SP5", author: "Ravi's Tuk Tuk Tours", avatar: "🛺", role: "SME Business", content: "Explore Galle Fort like never before! 🏰 Custom tuk-tuk tours starting from Rs. 1,500. Sunset tours, food trails, and hidden gems! Listed on Pearl Hub.", likes: 124, comments: 31, shares: 15, time: "12 hours ago", type: "listing", location: "Galle", verified: true, verifiedLabel: "Verified SME" },
];

const MOCK_BUSINESSES: BusinessListing[] = [
  { id: "BL1", name: "Ceylon Tea Trails", category: "Tourism", image: "🍵", location: "Nuwara Eliya", rating: 4.8, reviews: 234, description: "Award-winning tea estate experiences with plantation bungalow stays.", featured: true, fee: "Rs. 2,500/mo" },
  { id: "BL2", name: "Colombo Street Eats", category: "Food & Dining", image: "🍛", location: "Colombo", rating: 4.6, reviews: 456, description: "Curated street food tours through Colombo's vibrant neighborhoods.", featured: true, fee: "Rs. 1,500/mo" },
  { id: "BL3", name: "Surf Lanka Academy", category: "Sports", image: "🏄", location: "Arugam Bay", rating: 4.9, reviews: 189, description: "Professional surf lessons for all levels in Sri Lanka's surf capital.", featured: false, fee: "Rs. 2,000/mo" },
  { id: "BL4", name: "Heritage Gems & Jewels", category: "Shopping", image: "💎", location: "Ratnapura", rating: 4.7, reviews: 312, description: "Certified Sri Lankan gemstones direct from the City of Gems.", featured: true, fee: "Rs. 3,000/mo" },
];

const VerifiedBadge = ({ label }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/20 backdrop-blur-sm">
    ✓ {label || "Verified"}
  </span>
);

const SocialPage = () => {
  const { showToast } = useAppContext();
  const { user, profile } = useAuth();
  const isSME = profile?.role === "sme";
  const isAdmin = profile?.role === "admin";
  const canPost = !!user; // all authenticated users can post

  const [activeTab, setActiveTab] = useState<"feed" | "explore" | "businesses" | "tourism">("feed");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [showRegister, setShowRegister] = useState(false);

  // SME Products State
  const [smeProducts, setSmeProducts] = useState<SMEProduct[]>([
    { id: "P1", name: "Ceylon Cinnamon Sticks (100g)", price: 850, quantity: 250, description: "Premium grade organic Ceylon cinnamon", images: [], active: true, category: "Spices" },
    { id: "P2", name: "Black Pepper Whole (200g)", price: 1200, quantity: 180, description: "Hand-picked Matale black pepper", images: [], active: true, category: "Spices" },
    { id: "P3", name: "Guided Spice Tour (per person)", price: 3500, quantity: 999, description: "2-hour guided tour of our spice garden", images: [], active: false, category: "Services" },
  ]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<SMEProduct | null>(null);
  const [productForm, setProductForm] = useState({ name: "", price: 0, quantity: 0, description: "", images: [] as string[], category: "Products" });

  const tabs = [
    { id: "feed" as const, label: "Feed", icon: "📱" },
    { id: "explore" as const, label: "Explore", icon: "🔍" },
    { id: "businesses" as const, label: "SME Directory", icon: "🏪" },
    { id: "tourism" as const, label: "Tourism Boost", icon: "🌴" },
  ];

  const handlePost = () => {
    if (!newPost.trim() || !canPost) return;
    setPosts([{
      id: `SP${Date.now()}`, author: profile?.full_name || "You", avatar: "👤",
      role: profile?.role === "sme" ? "SME Business" : "Member",
      content: newPost, likes: 0, comments: 0, shares: 0, time: "Just now",
      type: "status", verified: !!profile?.verified,
      verifiedLabel: profile?.verified ? (profile?.role === "sme" ? "Verified SME" : "Verified Member") : undefined,
    }, ...posts]);
    setNewPost("");
    showToast("Status posted!", "success");
  };

  const handleLike = (id: string) => setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));

  const toggleProductActive = (id: string) => {
    setSmeProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    showToast("Product status updated", "success");
  };

  const openProductModal = (product?: SMEProduct) => {
    if (product) {
      setEditProduct(product);
      setProductForm({ name: product.name, price: product.price, quantity: product.quantity, description: product.description, images: product.images, category: product.category });
    } else {
      setEditProduct(null);
      setProductForm({ name: "", price: 0, quantity: 0, description: "", images: [], category: "Products" });
    }
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (!productForm.name || productForm.price <= 0) return;
    if (editProduct) {
      setSmeProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...productForm } : p));
      showToast("Product updated!", "success");
    } else {
      setSmeProducts(prev => [...prev, { id: `P${Date.now()}`, ...productForm, active: true }]);
      showToast("Product added!", "success");
    }
    setShowProductModal(false);
  };

  const deleteProduct = (id: string) => {
    setSmeProducts(prev => prev.filter(p => p.id !== id));
    showToast("Product removed", "success");
  };

  const typeColors: Record<string, string> = { status: "bg-sapphire/10 text-sapphire", listing: "bg-emerald/10 text-emerald", tourism: "bg-primary/15 text-gold-dark", ad: "bg-ruby/10 text-ruby" };

  return (
    <div className="min-h-screen bg-background">
      <div className="py-10" style={{ background: "linear-gradient(135deg, hsl(174 60% 35%), hsl(174 60% 18%))" }}>
        <div className="container">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-pearl text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">🌐 Social Hub</div>
          <h1 className="text-pearl text-3xl">Pearl Hub Community</h1>
          <p className="text-pearl/75 mt-1.5">Connect • Share • Discover • Grow your business</p>
        </div>
      </div>

      <div className="bg-card border-b border-border py-3">
        <div className="container flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${activeTab === t.id ? "text-pearl border-teal" : "bg-transparent text-muted-foreground border-input"}`}
              style={activeTab === t.id ? { background: "hsl(174 60% 35%)" } : {}}>
              {t.icon} {t.label}
            </button>
          ))}
          {(isSME || isAdmin) && (
            <button onClick={() => setShowRegister(true)} className="ml-auto px-4 py-1.5 rounded-full text-[13px] font-bold text-pearl transition-all" style={{ background: "hsl(174 60% 35%)" }}>
              🏪 Register Business
            </button>
          )}
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div>
            {/* Post composer - all authenticated users */}
            {canPost && (activeTab === "feed" || activeTab === "explore") && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-lg flex-shrink-0">👤</div>
                  <div className="flex-1">
                    <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share an update, recommend a place, or promote your business…"
                      className="w-full border-none outline-none text-sm bg-transparent resize-none" rows={3} />
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <div className="flex gap-2">
                        <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded">📷 Photo</button>
                        <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded">📍 Location</button>
                        <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded">🏪 Tag Business</button>
                      </div>
                      <button onClick={handlePost} className="px-4 py-1.5 rounded-lg text-xs font-bold text-pearl" style={{ background: "hsl(174 60% 35%)" }}>Post</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {!canPost && (activeTab === "feed" || activeTab === "explore") && (
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border mb-6 text-center">
                <p className="text-sm text-muted-foreground">🔒 Sign in to share updates and interact with the community</p>
              </div>
            )}

            {/* Feed */}
            {(activeTab === "feed" || activeTab === "explore" || activeTab === "tourism") && (
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {posts.filter(p => activeTab === "tourism" ? p.type === "tourism" || p.type === "ad" : true).map((post, i) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">{post.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{post.author}</span>
                            {post.verified && <VerifiedBadge label={post.verifiedLabel} />}
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${typeColors[post.type]}`}>{post.type}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{post.role} • {post.time}{post.location ? ` • 📍 ${post.location}` : ""}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 pt-3 border-t border-border flex-wrap">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-ruby transition-colors">❤️ {post.likes}</button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-sapphire transition-colors">💬 {post.comments}</button>
                        <ShareButtons title={post.content.slice(0, 60)} description={post.content} />
                        <button className="ml-auto text-xs text-muted-foreground hover:text-foreground">⚑ Report</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Businesses Directory */}
            {activeTab === "businesses" && (
              <div>
                {/* SME My Products Section */}
                {(isSME || isAdmin) && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">🛒 My Products & Services</h3>
                      <button onClick={() => openProductModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-pearl" style={{ background: "hsl(174 60% 35%)" }}>
                        <PlusCircle className="w-4 h-4" /> Add Product
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {smeProducts.map(product => (
                        <div key={product.id} className={`bg-card/80 backdrop-blur-sm rounded-xl p-4 border transition-all ${product.active ? "border-border" : "border-border/50 opacity-60"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">{product.name}</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sapphire/10 text-sapphire">{product.category}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{product.description}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Switch checked={product.active} onCheckedChange={() => toggleProductActive(product.id)} />
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                            <div className="flex gap-4">
                              <span className="text-sm font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground">📦 {product.quantity} in stock</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => openProductModal(product)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all" title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteProduct(product.id)} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-[10px] font-bold">
                            {product.active ? <span className="text-emerald">● Live</span> : <span className="text-muted-foreground">● Paused</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold mb-4">🏪 Business Directory</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_BUSINESSES.map((biz, i) => (
                    <motion.div key={biz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all">
                      <div className="h-28 flex items-center justify-center text-5xl relative" style={{ background: "linear-gradient(135deg, hsl(174 60% 35% / 0.1), transparent)" }}>
                        {biz.image}
                        {biz.featured && <span className="absolute top-2.5 right-2.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-gold-dark backdrop-blur-sm">⭐ Featured</span>}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-base font-bold">{biz.name}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald/10 text-emerald">{biz.category}</span>
                        </div>
                        <div className="text-[13px] text-muted-foreground mb-2">📍 {biz.location} • ★ {biz.rating} ({biz.reviews})</div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{biz.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Listing: {biz.fee}</span>
                          <button className="px-3 py-1 rounded text-xs font-bold text-pearl" style={{ background: "hsl(174 60% 35%)" }}>View</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border mb-4">
              <h4 className="font-bold text-sm mb-3">🔥 Trending Places</h4>
              {["Sigiriya Rock Fortress", "Galle Fort Walk", "Ella Nine Arches", "Yala Safari", "Mirissa Whales"].map((place, i) => (
                <div key={place} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 text-sm font-medium">{place}</div>
                  <span className="text-[10px] text-muted-foreground">{Math.floor(Math.random() * 500 + 100)} posts</span>
                </div>
              ))}
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border mb-4">
              <h4 className="font-bold text-sm mb-3">📍 Location Features</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">Enable location to discover nearby businesses, events, and tourist attractions.</p>
              <button className="w-full py-2 rounded-lg text-xs font-bold text-pearl" style={{ background: "hsl(174 60% 35%)" }}>📍 Enable Location</button>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border">
              <h4 className="font-bold text-sm mb-3">🛡️ Safety & Trust</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">✅ Verified business profiles</div>
                <div className="flex items-center gap-2">📍 Location-based fraud detection</div>
                <div className="flex items-center gap-2">⚑ Community reporting system</div>
                <div className="flex items-center gap-2">🔒 NIC verification for sellers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Registration Modal - SME & Admin only */}
      {showRegister && (
        <div className="fixed inset-0 bg-obsidian/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-5 fade-in" onClick={() => setShowRegister(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card/95 backdrop-blur-md rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto border border-border/50 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-6 flex justify-between" style={{ background: "linear-gradient(135deg, hsl(174 60% 35%), hsl(174 60% 18%))" }}>
              <div>
                <h2 className="text-pearl text-xl mb-1">🏪 Register Your Business</h2>
                <p className="text-pearl/70 text-sm">Get discovered by tourists and locals</p>
              </div>
              <button onClick={() => setShowRegister(false)} className="bg-white/15 backdrop-blur-sm border-none text-pearl w-9 h-9 rounded-full cursor-pointer hover:bg-white/25 transition-all">✕</button>
            </div>
            <div className="p-7">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-xs font-semibold mb-1">Business Name *</label><input className="w-full rounded-md border border-input px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Category *</label>
                  <select className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card"><option>Tourism</option><option>Food & Dining</option><option>Shopping</option><option>Sports & Adventure</option><option>Services</option><option>Accommodation</option></select>
                </div>
              </div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Location *</label><input className="w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="City / Area" /></div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Description</label><textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" /></div>
              <div className="mb-3"><label className="block text-xs font-semibold mb-1">Contact Phone</label><input className="w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="+94 77 123 4567" /></div>
              <ImageUpload bucket="listings" maxFiles={3} onUpload={() => {}} label="Business Photos" className="mb-3" />
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-border/50">
                <h4 className="text-sm font-bold mb-2">💰 Listing Plans</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[{ name: "Basic", price: "Rs. 1,500/mo", feat: "Profile + Feed posts" }, { name: "Pro", price: "Rs. 2,500/mo", feat: "Featured + Analytics" }, { name: "Premium", price: "Rs. 5,000/mo", feat: "Ads + Priority listing" }].map(plan => (
                    <div key={plan.name} className="p-3 border border-border rounded-lg text-center cursor-pointer hover:border-primary/30 transition-all">
                      <div className="text-xs font-bold">{plan.name}</div>
                      <div className="text-sm font-bold text-primary my-1">{plan.price}</div>
                      <div className="text-[10px] text-muted-foreground">{plan.feat}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { showToast("Business listing submitted for review!", "success"); setShowRegister(false); }}
                className="w-full text-pearl py-3 rounded-lg font-bold transition-all" style={{ background: "hsl(174 60% 35%)" }}>🚀 Submit Listing</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Add/Edit Modal - SME only */}
      {showProductModal && (
        <div className="fixed inset-0 bg-obsidian/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowProductModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card/95 backdrop-blur-md rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto border border-border/50 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-5 flex justify-between items-center" style={{ background: "linear-gradient(135deg, hsl(174 60% 35%), hsl(174 60% 18%))" }}>
              <h2 className="text-pearl text-lg">{editProduct ? "✏️ Edit Product" : "➕ Add Product / Service"}</h2>
              <button onClick={() => setShowProductModal(false)} className="bg-white/15 border-none text-pearl w-8 h-8 rounded-full cursor-pointer hover:bg-white/25 transition-all">✕</button>
            </div>
            <div className="p-7 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Product / Service Name *</label>
                <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="e.g. Ceylon Cinnamon 100g" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm bg-card">
                    <option>Products</option><option>Services</option><option>Spices</option><option>Food</option><option>Tours</option><option>Handicrafts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Price (Rs.) *</label>
                  <input type="number" min={0} value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-md border border-input px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Quantity / Stock</label>
                <input type="number" min={0} value={productForm.quantity} onChange={e => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm resize-y" placeholder="Describe your product or service…" />
              </div>
              <ImageUpload bucket="listings" maxFiles={3} onUpload={urls => setProductForm({ ...productForm, images: urls })} existingUrls={productForm.images} label="Product Photos" />
              <button onClick={saveProduct} disabled={!productForm.name || productForm.price <= 0}
                className="w-full text-pearl py-3 rounded-lg font-bold transition-all disabled:opacity-50" style={{ background: "hsl(174 60% 35%)" }}>
                {editProduct ? "💾 Update Product" : "➕ Add Product"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SocialPage;
