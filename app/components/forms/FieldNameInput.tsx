"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COMMON_LOCATION_FIELD_NAMES } from "@/lib/location-field-presets";

type FieldNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  id?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  variant?: "default" | "title";
};

const inputClassName =
  "w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-950 outline-none ring-rose-300 focus:border-rose-400 focus:ring-2 disabled:opacity-50";

const titleClassName =
  "w-full bg-transparent text-sm font-semibold text-rose-950 outline-none placeholder:text-rose-300 disabled:opacity-50";

export function FieldNameInput({
  value,
  onChange,
  onBlur,
  disabled,
  id,
  required,
  className = "",
  placeholder = "Field name",
  variant = "default",
}: FieldNameInputProps) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = COMMON_LOCATION_FIELD_NAMES.filter(
    (name) =>
      !value.trim() || name.toLowerCase().includes(value.trim().toLowerCase())
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectPreset(name: string) {
    onChange(name);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        id={id}
        list={listId}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-listbox`}
        aria-autocomplete="list"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
          onBlur?.();
        }}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={variant === "title" ? titleClassName : inputClassName}
      />
      <datalist id={listId}>
        {COMMON_LOCATION_FIELD_NAMES.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {open && filtered.length > 0 && !disabled ? (
        <ul
          id={`${listId}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-rose-200 bg-white py-1 shadow-lg shadow-rose-100/80"
        >
          {filtered.map((name) => (
            <li key={name} role="option" aria-selected={value === name}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectPreset(name)}
                className="flex min-h-10 w-full items-center px-3 py-2 text-left text-sm text-rose-950 transition-colors hover:bg-rose-50"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
