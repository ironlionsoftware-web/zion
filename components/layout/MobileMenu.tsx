"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/site";

type MobileMenuProps = {
  nav: readonly NavItem[];
};

export function MobileMenu({ nav }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
      const firstLink = dialog.querySelector<HTMLElement>("nav a, nav button");
      firstLink?.focus();
    } else if (dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      openButtonRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-subtle text-earth outline-none transition hover:border-[var(--rasta-green)] hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 lg:hidden motion-reduce:transition-none"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        id="site-mobile-menu"
        className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none flex-col border-0 bg-[var(--cream)] p-0 text-[var(--foreground)] backdrop:bg-[var(--earth)]/40 open:flex lg:hidden"
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
      >
        <div className="symbol-band h-0.5 shrink-0" aria-hidden="true" />
        <div className="flex items-center justify-between border-b border-subtle px-4 py-4">
          <p id={titleId} className="font-display text-xl font-medium">
            Menu
          </p>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold text-[var(--rasta-green)] outline-none hover:text-[var(--rasta-red)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-3.5 text-base font-medium text-earth outline-none hover:bg-surface-muted hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="btn btn-primary mx-3 mt-4 w-[calc(100%-1.5rem)] sm:w-auto"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </dialog>
    </>
  );
}
