import React, { forwardRef } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, disabled = false, placeholder = 'Enter 10-digit mobile number', error }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
      onChange(cleaned);
    };

    return (
      <div className="w-full">
        <div className="relative flex">
          {/* Country code */}
          <div className="flex items-center gap-2 bg-slate-700 border border-r-0 border-slate-600 rounded-l-xl px-3 text-slate-300 text-sm font-medium select-none whitespace-nowrap">
            🇮🇳 +91
          </div>
          {/* Input */}
          <div className="relative flex-1">
            <input
              ref={ref}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value}
              onChange={handleChange}
              disabled={disabled}
              placeholder={placeholder}
              className={`
                w-full bg-slate-800/60 border rounded-r-xl text-white placeholder-slate-500
                px-4 py-3 text-lg font-medium tracking-widest
                transition-all duration-200 outline-none
                focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error ? 'border-red-500' : 'border-slate-700 hover:border-slate-600'}
              `}
              aria-label="Mobile phone number"
            />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">⚠ {error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
