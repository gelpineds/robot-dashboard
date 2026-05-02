interface RouteMapProps {
  from?: string;
  to?: string;
}

export function RouteMap({ from = "Pickup", to = "Delivery" }: RouteMapProps) {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200"
      style={{ height: 280 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#E5E7EB",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span className="absolute top-3 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest z-10">
        Route Overview
      </span>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <line x1="28%" y1="65%" x2="72%" y2="35%" stroke="#800000" strokeWidth="2.5" strokeDasharray="8 5" strokeLinecap="round" />
        <circle cx="28%" cy="65%" r="6" fill="#FFD700" stroke="#800000" strokeWidth="2" />
        <circle cx="72%" cy="35%" r="6" fill="#800000" stroke="#fff" strokeWidth="2" />
      </svg>
      <div
        className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
        style={{ left: "calc(28% - 52px)", top: "calc(65% + 14px)" }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: "#FFD700" }} />
        <span className="text-[10px] font-semibold text-[#1A1A1A]">{from}</span>
      </div>
      <div
        className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
        style={{ right: "calc(28% - 52px)", top: "calc(35% - 24px)" }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: "#800000" }} />
        <span className="text-[10px] font-semibold text-[#1A1A1A]">{to}</span>
      </div>
    </div>
  );
}
