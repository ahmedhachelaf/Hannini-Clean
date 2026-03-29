"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type OTPInputProps = {
  length?: number;
  onComplete: (code: string) => void;
};

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [values, setValues] = useState<string[]>(() => Array.from({ length }, () => ""));

  const code = useMemo(() => values.join(""), [values]);

  useEffect(() => {
    if (code.length === length) {
      onComplete(code);
    }
  }, [code, length, onComplete]);

  function updateValue(index: number, nextValue: string) {
    setValues((current) => {
      const clone = [...current];
      clone[index] = nextValue;
      return clone;
    });
  }

  function handleChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      updateValue(index, "");
      return;
    }

    const next = digits[0];
    updateValue(index, next);

    if (digits.length > 1) {
      const remaining = digits.slice(1).split("");
      setValues((current) => {
        const clone = [...current];
        remaining.forEach((digit, offset) => {
          const targetIndex = index + 1 + offset;
          if (targetIndex < length) {
            clone[targetIndex] = digit;
          }
        });
        return clone;
      });
      const focusIndex = Math.min(index + remaining.length + 1, length - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (values[index]) {
        updateValue(index, "");
        return;
      }
      if (index > 0) {
        updateValue(index - 1, "");
        inputsRef.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length).split("");
    if (!digits.length) return;
    setValues((current) => {
      const clone = [...current];
      for (let index = 0; index < length; index += 1) {
        clone[index] = digits[index] ?? "";
      }
      return clone;
    });
    inputsRef.current[Math.min(digits.length, length) - 1]?.focus();
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {values.map((value, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={value}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          dir="ltr"
          className={`h-14 w-12 rounded-[10px] border-[1.5px] border-sand-dark text-center text-2xl font-bold text-[var(--ink)] shadow-sm outline-none transition focus:border-terracotta focus:ring-4 focus:ring-[rgba(196,97,42,0.15)] ${
            value ? "bg-terracotta-pale" : "bg-white"
          }`}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
