"use client";

import { useEffect, useState } from "react";
import { generateUserCode, getCookieValue, getPersistedUserCode, normalizeUserCode, setUserCode, USER_CODE_COOKIE } from "@/lib/user-code";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCodeState] = useState<string | null>(null);

  useEffect(() => {
    const persisted = getPersistedUserCode();
    setUserCodeState(persisted);

    if (persisted && !getCookieValue(USER_CODE_COOKIE)) {
      setUserCode(persisted);
      window.location.reload();
    }
  }, []);

  function handleLogin(code: string) {
    const normalized = normalizeUserCode(code);
    if (!normalized) {
      setError("Please enter an 8-character code using letters and digits.");
      return;
    }

    setUserCode(normalized);
    window.location.reload();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleLogin(inputValue);
  }

  function handleGenerate() {
    const newCode = generateUserCode();
    setInputValue(newCode);
    handleLogin(newCode);
  }

  if (userCode) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50 px-4 py-10 text-rose-950">
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-xl shadow-rose-100">
        <div className="mb-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-700/90">Access code</p>
          <h1 className="text-3xl font-semibold tracking-tight text-rose-950">Enter your 8-digit code</h1>
          <p className="text-sm text-rose-600">
            Use a personal code so your activities stay linked to the same identity without a password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-rose-900">Your code</label>
          <input
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="ABC12345"
            maxLength={8}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm outline-none ring-rose-300 focus:border-rose-400 focus:ring-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="inline-flex w-full justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex w-full justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Generate a new code
          </button>
        </form>
      </div>
    </div>
  );
}
