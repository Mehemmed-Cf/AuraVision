import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { searchNominatimAddress, type AddressSuggestion } from '@/services/locationService';

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: AddressSuggestion) => void;
}

export function AddressAutocomplete({
  label,
  placeholder,
  ariaLabel,
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length < 2) {
        setResults([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const found = await searchNominatimAddress(value);
      setResults(found);
      setOpen(true);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!boxRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      {label ? <label className="mb-1 block text-[13px] text-[var(--text-2)]">{label}</label> : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-3)]" />
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="w-full rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] py-2.5 pl-10 pr-3 text-[15px] text-[var(--text-1)]"
        />
      </div>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-auto rounded-[var(--r-md)] border border-[var(--navy-border)] bg-[var(--navy-raised)] shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-[13px] text-[var(--text-2)]">Axtarılır...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="block w-full border border-transparent border-b-[var(--navy-border)] px-3 py-2 text-left text-[13px] text-[var(--text-1)] last:border-b-0 hover:border-[var(--cyan)] hover:bg-[var(--cyan-dim)]"
              >
                {item.displayName}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-[13px] text-[var(--text-2)]">Nəticə tapılmadı</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
