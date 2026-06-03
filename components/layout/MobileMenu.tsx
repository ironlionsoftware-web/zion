"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/content/site";

type MobileMenuProps = {
  nav: readonly NavItem[];
};

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.dataset.scrollLockY = String(scrollY);
}

function unlockBodyScroll() {
  const scrollY = Number(document.body.dataset.scrollLockY ?? "0");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  delete document.body.dataset.scrollLockY;
  window.scrollTo(0, scrollY);
}

export function MobileMenu({ nav }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const pathname = usePathname();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    lockBodyScroll();
    const raf = requestAnimationFrame(() => {
      const firstLink = dialog.querySelector<HTMLElement>("nav a");
      firstLink?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(raf);
      if (dialog.open) dialog.close();
      unlockBodyScroll();
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      openButtonRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        className="inline-flex shrink-0 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-sm border border-subtle text-earth outline-none transition hover:border-[var(--rasta-green)] hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 lg:hidden motion-reduce:transition-none"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-haspopup="dialog"
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
        className="mobile-menu-dialog fixed inset-0 z-50 m-0 flex h-[100dvh] max-h-none w-full max-w-none flex-col border-0 bg-[var(--cream)] p-0 text-[var(--foreground)] backdrop:bg-[var(--earth)]/40 open:flex lg:hidden"
        aria-labelledby={titleId}
        aria-modal="true"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeMenu();
        }}
      >
        <div className="symbol-band h-0.5 shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-center justify-between border-b border-subtle px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p id={titleId} className="font-display text-xl font-medium">
            Menu
          </p>
          <button
            type="button"
            className="touch-manipulation min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold text-[var(--rasta-green)] outline-none hover:text-[var(--rasta-red)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
            onClick={closeMenu}
          >
            Close
          </button>
        </div>
        <nav
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          aria-label="Mobile"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="touch-manipulation rounded-sm px-3 py-4 text-base font-medium leading-snug text-earth outline-none hover:bg-surface-muted hover:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 active:bg-surface-muted"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="btn btn-primary mx-0 mt-4 w-full touch-manipulation"
            onClick={closeMenu}
          >
            Contact
          </Link>
        </nav>
      </dialog>
    </>
  );
}
