"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/site";

type MobileMenuProps = {
  nav: readonly NavItem[];
};

export function MobileMenu({ nav }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-stone-600 text-stone-100 outline-none transition hover:border-amber-400/60 hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 md:hidden"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-6 bg-current motion-reduce:transition-none" />
          <span className="block h-0.5 w-6 bg-current motion-reduce:transition-none" />
          <span className="block h-0.5 w-6 bg-current motion-reduce:transition-none" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        id="site-mobile-menu"
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-stone-950/95 p-0 text-stone-100 backdrop:bg-stone-950/60 open:flex open:flex-col motion-reduce:transition-none md:hidden"
        aria-labelledby={titleId}
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-4 py-4">
          <p id={titleId} className="text-lg font-semibold tracking-tight">
            Menu
          </p>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-md text-sm font-medium text-amber-300 outline-none hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-6" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-3 text-lg outline-none hover:bg-stone-900 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </dialog>
    </>
  );
}
