interface SelectInputProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: boolean;
}

export function SelectInput({
  options, value, onChange, placeholder, error,
}: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none transition-all text-[#1A1A1A] appearance-none"
      style={{ borderColor: error ? "#fca5a5" : "#E5E7EB" }}
      onFocus={(e) => {
        e.target.style.borderColor = "#800000";
        e.target.style.boxShadow = "0 0 0 3px rgba(128,0,0,0.08)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? "#fca5a5" : "#E5E7EB";
        e.target.style.boxShadow = "none";
      }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
