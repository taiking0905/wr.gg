import React from 'react';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
};
export const Select: React.FC<SelectProps> = ({options, value, onChange, className  }) => {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}