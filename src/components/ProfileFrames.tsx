import { Clock } from "lucide-react";

const ProfileFrames = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Profile Frames are being redesigned with exciting new styles. Stay tuned for the launch!
      </p>
    </div>
  );
};

export default ProfileFrames;
const FRAMES = [
  { id: 1, name: "Follow Me", price: 0, style: "ring-[5px] ring-purple-500", overlay: "follow-me" },
  { id: 2, name: "Social Hearts", price: 0, style: "ring-[5px] ring-pink-400 ring-offset-2 ring-offset-pink-100", overlay: null },
  { id: 3, name: "Floral Pink", price: 100, style: "border-[6px] border-dashed border-pink-300", overlay: null },
  { id: 4, name: "Gold Crown", price: 0, style: "ring-[5px] ring-yellow-500", overlay: "crown" },
  { id: 5, name: "LIVE Ring", price: 0, style: "ring-[5px] ring-red-500", overlay: "live" },
  { id: 6, name: "Gold Circle", price: 150, style: "ring-[6px] ring-yellow-600 ring-offset-2", overlay: null },
  { id: 7, name: "Premium Gold", price: 0, style: "ring-[6px] ring-gradient-gold border-4 border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]", overlay: null },
  { id: 8, name: "Royal Crown", price: 500, style: "ring-[5px] ring-amber-500 ring-offset-2 ring-offset-amber-100", overlay: "royal-crown" },
  { id: 9, name: "Center Crown", price: 400, style: "ring-[6px] ring-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]", overlay: "big-crown" },
  { id: 10, name: "Royal Badge", price: 0, style: "ring-[5px] ring-gray-900 ring-offset-2 ring-offset-yellow-500", overlay: null },
  { id: 11, name: "Gradient BG", price: 0, style: "ring-[6px] ring-transparent bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[3px]", overlay: null },
  { id: 12, name: "Heart React", price: 0, style: "ring-[5px] ring-red-400", overlay: "hearts" },
  { id: 13, name: "Sharp Crown", price: 700, style: "ring-[6px] ring-yellow-600 shadow-[0_0_25px_rgba(202,138,4,0.5)]", overlay: "fancy-crown" },
  { id: 14, name: "Love Hearts", price: 300, style: "ring-[5px] ring-pink-500 ring-offset-2", overlay: "love" },
  { id: 15, name: "Neon RGB", price: 0, style: "neon-ring", overlay: null },
  { id: 16, name: "No.1 Badge", price: 600, style: "ring-[6px] ring-yellow-500 ring-offset-2 ring-offset-yellow-100", overlay: "no1" },
  { id: 17, name: "Gold Medal", price: 250, style: "ring-[6px] ring-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.4)]", overlay: "medal" },
];

interface ProfileFramesProps {
  avatarUrl: string | null;
  displayName: string;
  currentFrame: number;
  onApply: (frameId: number) => void;
  userCoins?: number;
}

const ProfileFrames = ({ avatarUrl, displayName, currentFrame, onApply, userCoins = 0 }: ProfileFramesProps) => {
  const [selected, setSelected] = useState(currentFrame);
  const [unlockedFrames, setUnlockedFrames] = useState<number[]>([1, 2, 4, 5, 7, 10, 11, 12, 15]);
  const [coins, setCoins] = useState(userCoins);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [pendingFrame, setPendingFrame] = useState<typeof FRAMES[0] | null>(null);

  const handleSelect = (frame: typeof FRAMES[0]) => {
    if (frame.price > 0 && !unlockedFrames.includes(frame.id)) {
      if (coins < frame.price) {
        setPendingFrame(frame);
        setShowCoinModal(true);
        return;
      }
      setCoins(prev => prev - frame.price);
      toast.success(`Unlocked "${frame.name}" for ${frame.price} QDC!`);
      setUnlockedFrames(prev => [...prev, frame.id]);
    }
    setSelected(frame.id);
  };

  const handleApply = () => {
    onApply(selected);
    toast.success("Frame applied!");
  };

  const handleCoinPurchaseSuccess = (newBalance: number) => {
    setCoins(newBalance);
    if (pendingFrame) {
      toast.info(`Now try selecting "${pendingFrame.name}" again!`);
      setPendingFrame(null);
    }
  };

  const renderOverlay = (overlay: string | null) => {
    if (!overlay) return null;
    switch (overlay) {
      case "crown":
      case "royal-crown":
      case "big-crown":
      case "fancy-crown":
        return (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Crown className="w-5 h-5 text-yellow-500 fill-yellow-400" />
          </div>
        );
      case "live":
        return (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full animate-pulse-live">
            LIVE
          </div>
        );
      case "follow-me":
        return (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 bg-purple-500 text-white text-[7px] font-bold rounded-full whitespace-nowrap">
            FOLLOW ME
          </div>
        );
      case "hearts":
      case "love":
        return (
          <div className="absolute -bottom-1 -right-1 z-10 text-red-500 text-sm">❤️</div>
        );
      case "no1":
        return (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-5 h-5 bg-yellow-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-md">
            1
          </div>
        );
      case "medal":
        return (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 w-6 h-6 bg-gradient-to-b from-yellow-400 to-amber-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-300">
            ★
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            <h3 className="font-display text-base font-bold text-foreground">Profile Frames</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 rounded-full">
            <Coins className="w-3.5 h-3.5 text-accent" />
            <span className="font-body text-xs font-bold text-accent">{coins} QDC</span>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {renderOverlay(FRAMES.find(f => f.id === selected)?.overlay || null)}
            <div className={`w-24 h-24 rounded-full overflow-hidden transition-all duration-300 ${
              selected === 15 ? '' : FRAMES.find(f => f.id === selected)?.style || ''
            }`}
              style={selected === 15 ? {
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                padding: '4px',
                borderRadius: '50%',
              } : undefined}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-primary-foreground text-2xl font-bold">
                    {displayName[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-5">
          {FRAMES.map((frame) => {
            const isLocked = frame.price > 0 && !unlockedFrames.includes(frame.id);
            const isActive = selected === frame.id;
            return (
              <button
                key={frame.id}
                onClick={() => handleSelect(frame)}
                className="flex flex-col items-center gap-1.5 group relative"
              >
                <div className="relative">
                  {renderOverlay(frame.overlay)}
                  <div className={`w-12 h-12 rounded-full overflow-hidden transition-all ${
                    isActive ? 'scale-110 shadow-lg' : 'opacity-70 group-hover:opacity-100'
                  } ${frame.id === 15 ? '' : frame.style}`}
                    style={frame.id === 15 ? {
                      background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                      padding: '3px',
                      borderRadius: '50%',
                    } : undefined}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-primary-foreground text-xs font-bold">
                          {displayName[0]}
                        </div>
                      )}
                    </div>
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 rounded-full bg-foreground/30 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <span className={`text-[9px] font-bold leading-tight text-center ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {frame.name}
                </span>
                {frame.price > 0 && (
                  <span className={`text-[8px] font-bold ${isLocked ? 'text-secondary' : 'text-green-500'}`}>
                    {isLocked ? `${frame.price} QDC` : '✓'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Apply */}
        <div className="flex gap-3">
          <button
            onClick={handleApply}
            disabled={selected === currentFrame}
            className="flex-1 py-2.5 bg-primary text-primary-foreground font-display text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Apply Frame
          </button>
          <button
            onClick={() => setShowCoinModal(true)}
            className="px-4 py-2.5 bg-accent/10 text-accent font-display text-sm font-bold rounded-xl hover:bg-accent/20 transition-colors flex items-center gap-2"
          >
            <Coins className="w-4 h-4" /> Recharge
          </button>
        </div>
      </div>

      <CoinPurchaseModal
        isOpen={showCoinModal}
        onClose={() => setShowCoinModal(false)}
        onSuccess={handleCoinPurchaseSuccess}
      />
    </>
  );
};

export default ProfileFrames;
