"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
};

type MobileMenuProps = {
  locale: Locale;
  navItems: NavItem[];
  loginHref: string;
  loginLabel: string;
  menuLabel: string;
  closeLabel: string;
  children?: React.ReactNode;
};

export function MobileMenu({
  locale,
  navItems,
  loginHref,
  loginLabel,
  menuLabel,
  closeLabel,
  children,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = locale === "ar";

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={menuLabel}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(20,92,255,0.2)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(235,243,255,0.95))] text-[var(--navy)] shadow-[0_4px_14px_rgba(11,63,184,0.1)]"
      >
        <Menu size={18} strokeWidth={2.2} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[9998] cursor-pointer bg-[rgba(8,18,37,0.48)] backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          aria-label={closeLabel}
        />
      )}

      {/* Drawer panel */}
      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={menuLabel}
        className={`fixed top-0 z-[9999] flex h-screen w-[min(320px,90vw)] flex-col overflow-y-auto bg-[rgba(246,250,255,0.98)] shadow-[0_0_80px_rgba(13,28,69,0.22)] backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isRtl ? "left-0 border-e border-[var(--line)]" : "right-0 border-s border-[var(--line)]"
        } ${
          isOpen
            ? "translate-x-0"
            : isRtl
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <span className={`text-base font-extrabold tracking-tight text-[var(--navy)] ${isRtl ? "arabic-display" : ""}`}>
            هَنّيني
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={closeLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--soft)]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Login / Account prominent button */}
        <div className="px-4 pt-5">
          <Link
            href={loginHref}
            onClick={() => setIsOpen(false)}
            className="button-primary flex w-full items-center justify-center rounded-[1.25rem] text-sm font-bold"
          >
            {loginLabel}
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4" aria-label={menuLabel}>
          <ul className="space-y-0.5" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center rounded-[1rem] px-4 py-3 text-[0.97rem] font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--soft)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Install button slot */}
        {children && (
          <div className="border-t border-[var(--line)] px-4 py-4">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
