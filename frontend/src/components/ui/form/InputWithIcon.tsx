interface InputWithIconProps {
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: boolean;
}

export function InputWithIcon({
  icon: Icon, placeholder, value, onChange, type = "text", error,
}: InputWithIconProps) {
  return (
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
        style={{ color: error ? "#dc2626" : "#800000" }}
      />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all placeholder:text-gray-400 text-[#1A1A1A]"
        style={{
          borderColor: error ? "#fca5a5" : "#E5E7EB",
          boxShadow: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? "#dc2626" : "#800000";
          e.target.style.boxShadow = `0 0 0 3px ${error ? "rgba(220,38,38,0.08)" : "rgba(128,0,0,0.08)"}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#fca5a5" : "#E5E7EB";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
