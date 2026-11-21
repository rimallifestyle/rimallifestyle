import { useState } from "react";
import { X, MapPin, Target, Loader2 } from "lucide-react";

interface OnboardingModalProps {
  onComplete: (data: { size: string; address: string }) => void;
  onClose: () => void;
}

const sizes = ["S", "M", "L", "XL", "XXL"];

export function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [size, setSize] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState("");

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app with an API key, we would reverse geocode this.
        // For now, we will simulate a realistic looking address or just use coordinates.
        // Since we are simulating, we'll construct a mock address for demo purposes
        // or actually use the Nominatim API (free).

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        )
          .then(res => res.ok ? res.json() : null)
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            } else {
              setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          })
          .catch(() => {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          })
          .finally(() => {
            setIsDetecting(false);
          });
      },
      (error) => {
        setIsDetecting(false);
        setError("Unable to retrieve your location. Please type it manually.");
        console.error(error);
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!size) {
      setError("Please select your preferred size.");
      return;
    }
    if (!address.trim()) {
      setError("Please provide your delivery address.");
      return;
    }
    onComplete({ size, address });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-serif text-2xl text-cream">Welcome to Rimal!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Let's set up your profile for a faster checkout experience.
              </p>
            </div>
            {/* Close button to allow skipping */}
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-semibold text-cream mb-3">
                Your Preferred Size
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`h-11 min-w-[3rem] px-4 rounded-lg border flex items-center justify-center text-sm font-medium transition-colors ${
                      size === s
                        ? "border-gold bg-gold text-background"
                        : "border-border bg-secondary hover:border-gold/60 text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-cream">
                  Default Delivery Address
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="text-xs text-gold flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  {isDetecting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Target className="h-3 w-3" />
                  )}
                  Auto Detect
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {error && <p className="text-maroon-deep text-sm font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full h-12 bg-gold text-background font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Save & Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


