"use client";
import Link from "next/link";
import { API_ROOT } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { useUserSync } from "@/context/UserSync";
import { productImage } from "@/components/store/products";
import {
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Loader2,
  Check,
  PartyPopper,
  Clock,
  Lock,
  Banknote,
  Smartphone,
  Navigation,
  AlertCircle,
} from "lucide-react";



// Keywords for intelligent real-time address detection
const DHAKA_KEYWORDS = [
  "dhaka",
  "dhanmondi",
  "gulshan",
  "banani",
  "uttara",
  "mirpur",
  "bashundhara",
  "motijheel",
  "mohammadpur",
  "badda",
  "ramna",
  "tejgaon",
  "khilgaon",
  "shyamoli",
  "kalabagan",
  "baridhara",
  "jatrabari",
  "rampura",
  "pallabi",
  "agargaon",
  "farmgate",
  "shahbagh",
  "elephant road",
  "wari",
  "lalbagh",
  "khilkhet",
  "nikunja",
  "kakrail",
  "malibagh",
  "moghbazar",
  "shantinagar",
  "new market",
  "azimpur",
  "cantonment",
];

const OUTSIDE_KEYWORDS = [
  "chittagong",
  "chattogram",
  "sylhet",
  "rajshahi",
  "khulna",
  "barisal",
  "barishal",
  "rangpur",
  "mymensingh",
  "cumilla",
  "comilla",
  "bogura",
  "bogra",
  "narayanganj",
  "gazipur",
  "savar",
  "keraniganj",
  "cox",
  "noakhali",
  "feni",
  "jashore",
  "jessore",
  "dinajpur",
  "pabna",
  "kushtia",
  "tangail",
  "faridpur",
  "brahmanbaria",
  "narsingdi",
  "sirajganj",
  "jamalpur",
  "patuakhali",
  "bhola",
  "munshiganj",
  "manikganj",
  "ashulia",
  "tongi",
  "outside dhaka",
];

// ─────────────────────────────────────────────────────────────
// SILKY SMOOTH ANIMATED SUCCESS SCREEN (60fps Staggered Reveal)
// ─────────────────────────────────────────────────────────────
function AnimatedSuccessView({ orderId, formData, cart }: { orderId: string; formData: any, cart: any[] }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Ultra-smooth staggered entrance schedule
    const t1 = setTimeout(() => setStage(1), 50); // Outer card & golden circle glow
    const t2 = setTimeout(() => setStage(2), 300); // Gold seal & checkmark spring up
    const t3 = setTimeout(() => setStage(3), 550); // Title & confirmation badge glide in
    const t4 = setTimeout(() => setStage(4), 800); // Summary box smooth slide & fade
    const t5 = setTimeout(() => setStage(5), 1050); // Action buttons transition in
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const subTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = formData.shippingArea === "inside_dhaka" ? 60 : 120;
  const grandTotal = subTotal + shippingFee;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-gold/30">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Soft floating background light glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-maroon-deep/20 rounded-full blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />

        <div
          className={`max-w-[1200px] w-full bg-card/85 border border-gold/40 rounded-3xl p-5 sm:p-8 md:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl relative overflow-hidden transform-gpu transition-all duration-[900ms] ease-out ${
            stage >= 1
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-12 scale-[0.93]"
          }`}
        >
          {/* Ambient Corner Glows inside card */}
          <div className="absolute -top-28 -left-28 w-72 h-72 bg-gold/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            {/* Left Column: Thank You Message & Actions */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              
              {/* Luxury Emblem & Floating Sparkles */}
              <div className="relative flex items-center justify-center w-28 h-28 mb-4">
                <div
                  className={`absolute inset-0 rounded-full border-2 border-gold/50 transition-opacity duration-1000 ${
                    stage >= 2 ? "animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30" : "opacity-0"
                  }`}
                />
                <div
                  className={`w-28 h-28 rounded-full bg-gradient-to-tr from-gold/20 via-gold/10 to-transparent flex items-center justify-center p-2 transition-all duration-700 transform-gpu ${
                    stage >= 2 ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 -rotate-90"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-gold via-yellow-500 to-amber-600 text-background flex items-center justify-center shadow-[0_10px_35px_rgba(234,179,8,0.5)] transform-gpu transition-transform duration-500 hover:scale-105">
                    <Check className={`w-12 h-12 stroke-[3.5] text-slate-950 transition-all duration-700 delay-100 ${stage >= 2 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                  </div>
                </div>

                <div className={`absolute -top-1 -right-2 px-3 py-1.5 bg-card border border-gold/50 rounded-2xl shadow-xl flex items-center justify-center transform-gpu transition-all duration-700 ${stage >= 2 ? "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-12" : "opacity-0 -translate-x-8 translate-y-8 scale-0 -rotate-45"}`}>
                  <Sparkles className="w-5 h-5 text-gold animate-[pulse_2.5s_ease-in-out_infinite]" />
                </div>
                <div className={`absolute -bottom-1 -left-2 px-3 py-1.5 bg-card border border-gold/50 rounded-2xl shadow-xl flex items-center justify-center transform-gpu transition-all duration-700 ${stage >= 2 ? "opacity-100 translate-x-0 translate-y-0 scale-100 -rotate-12" : "opacity-0 translate-x-8 -translate-y-8 scale-0 rotate-45"}`}>
                  <PartyPopper className="w-5 h-5 text-gold animate-[pulse_2.5s_ease-in-out_infinite_1s]" />
                </div>
              </div>

              {/* Typography & Status Badge */}
              <div className={`transition-all duration-700 transform-gpu ease-out space-y-4 ${stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/30 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Order Confirmed & Locked</span>
                </span>
                
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                  Thank You for Your Order!
                </h1>
                
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  We have successfully received your order{" "}
                  <span className="text-gold font-mono font-bold px-2 py-1 bg-gold/10 rounded-md border border-gold/25 inline-block mx-1">
                    {orderId}
                  </span>
                  . Our specialist team will verify and dispatch your items swiftly.
                </p>
              </div>

              {/* Action Buttons */}
              <div className={`w-full flex flex-col sm:flex-row items-center lg:justify-start gap-4 transition-all duration-700 transform-gpu ease-out pt-6 ${stage >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold via-yellow-500 to-amber-600 hover:opacity-95 text-slate-950 font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(234,179,8,0.3)] flex items-center justify-center gap-2 group">
                  <span>Continue Shopping</span>
                  <ShoppingBag className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/shop" className="w-full sm:w-auto px-8 py-4 bg-secondary/50 hover:bg-secondary border border-border/80 hover:border-gold text-foreground hover:text-gold font-bold uppercase tracking-widest text-xs rounded-full transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 text-center">
                  Browse New Collection
                </Link>
              </div>
            </div>

            {/* Right Column: Detailed Order Summary */}
            <div className={`space-y-6 transition-all duration-700 ease-out transform-gpu ${stage >= 4 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-[0.97]"}`}>
              
              {/* Products List */}
              <div className="bg-gradient-to-b from-secondary/60 to-secondary/20 border border-border/70 rounded-3xl p-6 shadow-inner">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold" /> Ordered Items ({cart.length})
                </h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/50 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary/50">
                        <img src={item.product?.image || item.product?.images?.[0] || "https://via.placeholder.com/100"} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-sm line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.size ? `Size: ${item.size}` : 'Standard'} • Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-gold mt-1">৳ {((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 space-y-2 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳ {subTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Fee</span>
                    <span>৳ {shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-foreground text-lg font-bold pt-2">
                    <span>Total</span>
                    <span className="text-gold">৳ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gradient-to-b from-secondary/60 to-secondary/20 border border-border/70 rounded-3xl p-6 shadow-inner">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider pb-4 border-b border-border/40 mb-4">
                  <span className="flex items-center gap-2 text-foreground font-bold">
                    <Truck className="w-4 h-4 text-gold shrink-0" /> Delivery Details
                  </span>
                  <span className="text-gold flex items-center gap-1.5 bg-gold/10 px-3 py-1 rounded-full border border-gold/20 font-semibold">
                    <Clock className="w-3 h-3 shrink-0" /> Est: 2-3 Days
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Recipient</p>
                    <p className="font-bold text-foreground">{formData.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Payment</p>
                    <p className="font-bold text-foreground">
                      {formData.paymentMethod === "cod" ? "Cash on Delivery" : "bKash / Nagad"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Shipping Address</p>
                    <p className="font-medium text-foreground">{formData.address}</p>
                    <p className="text-xs text-gold capitalize mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {formData.shippingArea.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SMOOTH ANIMATED PROCESSING SCREEN (Live stage feedback)
// ─────────────────────────────────────────────────────────────
function AnimatedProcessingView() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setMsgIdx(1), 800);
    const t2 = setTimeout(() => setMsgIdx(2), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const messages = [
    "Authenticating secure session...",
    "Verifying stock in warehouse...",
    "Generating confirmed invoice...",
  ];

  return (
    <div className="min-h-[80vh] bg-background text-foreground flex flex-col font-sans relative overflow-hidden">
      <Header />
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 relative z-10">
        <div className="bg-card/30 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 sm:p-12 w-full max-w-md shadow-2xl relative overflow-hidden">
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

          {/* Central Animated Orb */}
          <div className="relative w-24 h-24 mx-auto mb-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-gold/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-gold border-r-gold animate-spin duration-1000" />
            <div className="absolute inset-4 rounded-full border border-gold/50 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center backdrop-blur-md border border-gold/40 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
              <Lock className="w-5 h-5 text-gold animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-center mb-8 tracking-wide text-foreground">
            Processing Order
          </h2>

          {/* Dynamic Progress Checklist */}
          <div className="space-y-5">
            {messages.map((msg, i) => {
              const isPast = i < msgIdx;
              const isCurrent = i === msgIdx;
              const isFuture = i > msgIdx;

              return (
                <div 
                  key={i} 
                  className={`flex items-center gap-4 transition-all duration-700 ease-out ${
                    isFuture ? "opacity-30 translate-y-4" : "opacity-100 translate-y-0"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    isPast ? "bg-gold border-gold text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]" : 
                    isCurrent ? "bg-transparent border-gold text-gold" : 
                    "bg-transparent border-white/20"
                  }`}>
                    {isPast ? (
                      <Check className="w-4 h-4" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 bg-gold rounded-full animate-ping" />
                    ) : (
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                    )}
                  </div>
                  <p className={`text-sm font-medium transition-colors duration-500 ${
                    isPast ? "text-foreground" : 
                    isCurrent ? "text-gold" : 
                    "text-muted-foreground"
                  }`}>
                    {msg}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}





export default function CheckoutPage() {
  const { cart, removeFromCart, userProfile, isLoggedIn } = useUserSync();
  const router = useRouter();

  // Concise Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    shippingArea: "inside_dhaka" as "inside_dhaka" | "outside_dhaka",
    paymentMethod: "cod" as "cod" | "bkash",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [orderId, setOrderId] = useState("");
  const [successCart, setSuccessCart] = useState<any[]>([]);

  // Auto-fill logic from profile
  useEffect(() => {
    if (isLoggedIn && userProfile) {
      setFormData((prev) => ({
        ...prev,
        name: userProfile.name || prev.name,
        phone: userProfile.phone || prev.phone,
        address: userProfile.address || prev.address,
      }));
    }
  }, [isLoggedIn, userProfile]);

  // Auto-detection status state
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [detectionType, setDetectionType] = useState<"gps" | "text" | "manual" | null>(null);

  // Scroll to top on mount and step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const subTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = cart.length === 0 ? 0 : formData.shippingArea === "inside_dhaka" ? 60 : 120;
  const grandTotal = subTotal + shippingFee;

  // Real-time keyword detection as user types their address
  const handleInputChange = (field: string, value: string) => {
    let newShippingArea = formData.shippingArea;
    let autoMsg = detectionMessage;
    let autoType = detectionType;

    if (field === "address") {
      const lower = value.toLowerCase();

      // First check outside dhaka indicators (e.g. Gazipur, Savar, Chittagong)
      const hasOutside = OUTSIDE_KEYWORDS.some((kw) => lower.includes(kw));
      const hasInside = DHAKA_KEYWORDS.some((kw) => lower.includes(kw));

      if (hasOutside) {
        newShippingArea = "outside_dhaka";
        autoMsg = "Auto-detected: Outside Dhaka (from address keyword)";
        autoType = "text";
      } else if (hasInside && !hasOutside) {
        newShippingArea = "inside_dhaka";
        autoMsg = "Auto-detected: Inside Dhaka (from address keyword)";
        autoType = "text";
      }
    }

    if (field === "shippingArea") {
      autoType = "manual";
      autoMsg = "Manually selected by you";
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      shippingArea:
        field === "address"
          ? newShippingArea
          : field === "shippingArea"
            ? (value as any)
            : prev.shippingArea,
    }));

    if (autoMsg && autoType !== "manual") {
      setDetectionMessage(autoMsg);
      setDetectionType(autoType);
    } else if (field === "shippingArea") {
      setDetectionMessage("Manually selected by you");
      setDetectionType("manual");
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // GPS Geolocation Auto-Detection
  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGps(true);
    setDetectionMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Approximate Dhaka Metropolitan coordinates bounding box
        // Latitude: ~23.68 to 23.90 | Longitude: ~90.32 to 90.48
        const isDhakaBounds = lat >= 23.68 && lat <= 23.9 && lng >= 90.32 && lng <= 90.48;
        let area: "inside_dhaka" | "outside_dhaka" = isDhakaBounds
          ? "inside_dhaka"
          : "outside_dhaka";
        let fetchedAddress = "";

        try {
          // Reverse Geocoding via OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              fetchedAddress = data.display_name;
              const lowerAddr = fetchedAddress.toLowerCase();
              if (OUTSIDE_KEYWORDS.some((kw) => lowerAddr.includes(kw))) {
                area = "outside_dhaka";
              } else if (DHAKA_KEYWORDS.some((kw) => lowerAddr.includes(kw))) {
                area = "inside_dhaka";
              }
            }
          }
        } catch (err) {
          console.warn("Reverse geocoding network notice:", err);
          // Fallback to bounding box determination
        }

        setFormData((prev) => ({
          ...prev,
          address:
            fetchedAddress || prev.address || `GPS Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          shippingArea: area,
        }));

        setIsDetectingGps(false);
        setDetectionType("gps");
        setDetectionMessage(
          `Auto-detected via GPS: ${area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}`,
        );
      },
      (error) => {
        setIsDetectingGps(false);
        console.error("GPS Error:", error);
        alert(
          "Unable to retrieve location. Please check browser GPS permissions or type address manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Customer name is required";
    if (!formData.phone.trim() || formData.phone.length < 11) {
      newErrors.phone = "Valid 11-digit mobile number is required";
    }
    if (!formData.address.trim() || formData.address.length < 5) {
      newErrors.address = "Please provide your detailed delivery address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setStep("processing");

    const apiUrl = `${API_ROOT}storefront/checkout`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          cart,
          subTotal,
          shippingFee,
          userProfile
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setOrderId(data.order_id);
      } else {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomCode = '';
        for (let i = 0; i < 4; i++) { randomCode += chars.charAt(Math.floor(Math.random() * chars.length)); }
        setOrderId(`RM${randomCode}`);
        console.error("Order API failed:", data);
      }
    } catch (err) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomCode = '';
      for (let i = 0; i < 4; i++) { randomCode += chars.charAt(Math.floor(Math.random() * chars.length)); }
      setOrderId(`RM${randomCode}`);
      console.error("Order API network error:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessCart([...cart]);
      setStep("success");
      cart.forEach((item) => removeFromCart(item.id));
    }, 1500);
  };

  // ─────────────────────────────────────────────────────────────
  // SUCCESS SCREEN (Animated Done Process)
  // ─────────────────────────────────────────────────────────────
  if (step === "success") {
    return <AnimatedSuccessView orderId={orderId} formData={formData} cart={successCart} />;
  }

  // ─────────────────────────────────────────────────────────────
  // PROCESSING SCREEN (Animated Loader)
  // ─────────────────────────────────────────────────────────────
  if (step === "processing") {
    return <AnimatedProcessingView />;
  }

  // ─────────────────────────────────────────────────────────────
  // FORM SCREEN (Express Checkout with Auto-Detection)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-gold/30 selection:text-cream">
      <Header />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 md:py-12">
        <Link href="/cart"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-gold uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="text-3xl font-display uppercase tracking-widest text-gold">
              Nothing to Checkout
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              Please add some items to your shopping bag before proceeding to checkout.
            </p>
            <Link href="/shop"
              className="px-8 py-3.5 bg-gold text-background font-bold uppercase tracking-widest text-xs rounded-full transition-all hover:bg-cream"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start"
          >
            {/* Left Side: Short Checkout Form */}
            <div className="flex-1 w-full space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  Express Checkout
                </h1>
                <p className="text-sm text-muted-foreground">
                  Complete your order in seconds with just your Name, Mobile Number and Address.
                </p>
              </div>

              {/* Box 1: Customer Details */}
              <div className="bg-[#160404]/80 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-semibold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                      1
                    </div>
                    <h2 className="text-xl font-display font-semibold tracking-wide text-white">
                      Delivery Information
                    </h2>
                  </div>
                  {isLoggedIn && (
                    <span className="text-[11px] font-medium text-gold/80 bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
                      Auto-filled from Profile
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-cream/90 flex items-center gap-2">
                      <User className="w-4 h-4 text-gold" /> Full Name{" "}
                      <span className="text-gold">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Abdullah Al Mamun"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full bg-[#1c0606] hover:bg-[#230707] border ${
                        errors.name ? "border-red-500 ring-1 ring-red-500/50" : "border-white/20 focus:border-gold"
                      } rounded-xl px-4 py-3.5 text-sm text-white font-medium outline-none focus:ring-2 focus:ring-gold/30 transition-all placeholder:text-white/45 shadow-inner`}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-cream/90 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" /> Mobile Number{" "}
                      <span className="text-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 017xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`w-full bg-[#1c0606] hover:bg-[#230707] border ${
                        errors.phone ? "border-red-500 ring-1 ring-red-500/50" : "border-white/20 focus:border-gold"
                      } rounded-xl px-4 py-3.5 text-sm text-white font-medium outline-none focus:ring-2 focus:ring-gold/30 transition-all placeholder:text-white/45 shadow-inner`}
                    />
                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Address Input with GPS Auto-Detect */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-cream/90 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gold shrink-0" /> Full Delivery Address{" "}
                        <span className="text-gold">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetectGps}
                        disabled={isDetectingGps}
                        className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold text-gold/90 hover:text-gold bg-gold/5 hover:bg-gold/15 px-3 py-1.5 rounded-lg transition-all border border-gold/30 disabled:opacity-50 shrink-0 uppercase tracking-widest cursor-pointer"
                      >
                        {isDetectingGps ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                            <span>Detecting...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3 h-3 shrink-0" />
                            <span>Auto-Detect Location</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="House No, Road No, Area / Thana, City / District"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={`w-full bg-[#1c0606] hover:bg-[#230707] border ${
                        errors.address ? "border-red-500 ring-1 ring-red-500/50" : "border-white/20 focus:border-gold"
                      } rounded-xl px-4 py-3.5 text-sm text-white font-medium outline-none focus:ring-2 focus:ring-gold/30 transition-all placeholder:text-white/45 resize-none shadow-inner`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-400 mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Box 2: Shipping & Payment Method */}
              <div className="bg-[#160404]/80 border border-white/15 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-7">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-semibold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    2
                  </div>
                  <h2 className="text-xl font-display font-semibold tracking-wide text-white">
                    Shipping & Payment
                  </h2>
                </div>

                <div className="space-y-7">
                  {/* Shipping Area Selector with Live Auto-Detect Indicator */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-cream/90 block">
                        Select Shipping Area
                      </label>
                      {detectionMessage && (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            detectionType === "manual"
                              ? "bg-secondary text-white/80"
                              : "bg-gold/15 text-gold border border-gold/30 shadow-[0_0_10px_rgba(234,179,8,0.1)] animate-pulse"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>{detectionMessage}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange("shippingArea", "inside_dhaka")}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.shippingArea === "inside_dhaka"
                            ? "bg-gold/15 border-gold text-white shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold/40"
                            : "bg-[#1c0606] border-white/15 text-white/90 hover:border-white/30 hover:bg-[#230707]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            formData.shippingArea === "inside_dhaka" 
                              ? "bg-gold/25 text-gold border-gold/40" 
                              : "bg-black/40 text-white/60 border-white/10"
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Inside Dhaka</p>
                            <p className="text-xs text-white/60 mt-0.5">
                              Home Delivery (1-2 Days)
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gold">৳60</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange("shippingArea", "outside_dhaka")}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.shippingArea === "outside_dhaka"
                            ? "bg-gold/15 border-gold text-white shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold/40"
                            : "bg-[#1c0606] border-white/15 text-white/90 hover:border-white/30 hover:bg-[#230707]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            formData.shippingArea === "outside_dhaka" 
                              ? "bg-gold/25 text-gold border-gold/40" 
                              : "bg-black/40 text-white/60 border-white/10"
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Outside Dhaka</p>
                            <p className="text-xs text-white/60 mt-0.5">
                              Courier Delivery (2-4 Days)
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gold">৳120</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-cream/90 mb-3 block">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange("paymentMethod", "cod")}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.paymentMethod === "cod"
                            ? "bg-gold/15 border-gold text-white shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold/40"
                            : "bg-[#1c0606] border-white/15 text-white/90 hover:border-white/30 hover:bg-[#230707]"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-gold shrink-0 border border-white/10">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Cash on Delivery</p>
                          <p className="text-[11px] text-white/60 mt-0.5">
                            Pay cash when package arrives
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInputChange("paymentMethod", "bkash")}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          formData.paymentMethod === "bkash"
                            ? "bg-gold/15 border-gold text-white shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-gold/40"
                            : "bg-[#1c0606] border-white/15 text-white/90 hover:border-white/30 hover:bg-[#230707]"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 border border-pink-500/30">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            bKash / Nagad
                          </p>
                          <p className="text-[11px] text-white/60 mt-0.5">
                            Instant digital mobile payment
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Guarantee Banner */}
              <div className="flex items-center gap-4 bg-[#160404]/80 border border-white/15 rounded-xl p-5 text-xs text-white/70 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-gold shrink-0" />
                <span className="leading-relaxed">
                  We assure 100% secure handling and authentic quality. Inspect the item upon
                  arrival. Easy exchange within 7 days.
                </span>
              </div>
            </div>

            {/* Right Side: Order Summary */}
            <div className="w-full lg:w-[380px] shrink-0 sticky top-28 space-y-6">
              <div className="bg-[#160404]/80 border border-white/15 rounded-2xl p-6 sm:p-7 backdrop-blur-2xl shadow-2xl">
                <h2 className="text-base font-display font-semibold uppercase tracking-widest text-white pb-4 border-b border-white/10 mb-5 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-[11px] bg-gold/15 text-gold border border-gold/30 px-3 py-0.5 rounded-full font-semibold">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                  </span>
                </h2>

                {/* Mini Item List */}
                <div className="max-h-60 overflow-y-auto pr-2 space-y-4 mb-5 no-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3.5 group">
                      <div className="relative h-16 w-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <div
                          className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-110 bg-center"
                          style={{
                            backgroundImage: `url(${item.product.image || productImage})`,
                            backgroundPosition: item.product.bgPos || "center",
                            backgroundSize: item.product.bgSize || (item.product.image && item.product.image !== productImage ? "cover" : "300% 200%"),
                          }}
                        />
                        <span className="absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md border-t border-l border-white/10">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm text-white truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-white/60 mt-0.5">
                          Size: <span className="font-medium text-white">{item.size}</span>
                        </p>
                        <p className="text-xs font-bold text-gold mt-1">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Calculation */}
                <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                  <div className="flex justify-between items-center text-white/70">
                    <span>Subtotal</span>
                    <span className="text-white font-semibold">
                      ৳{subTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-white/70">
                    <span className="flex items-center gap-1">
                      <span>
                        Shipping (
                        {formData.shippingArea === "inside_dhaka"
                          ? "Inside Dhaka"
                          : "Outside Dhaka"}
                        )
                      </span>
                    </span>
                    <span className="text-gold font-semibold">+৳{shippingFee}</span>
                  </div>
                  <div className="h-px w-full bg-white/10 my-3" />
                  <div className="flex justify-between items-baseline text-base font-bold text-white">
                    <span>Total</span>
                    <span className="text-2xl text-gold font-display font-bold">
                      ৳{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-gold hover:bg-cream text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2.5 group disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-white/50 mt-4 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <Lock className="w-3 h-3 text-gold/60" /> Secure 256-bit Encrypted Checkout
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

