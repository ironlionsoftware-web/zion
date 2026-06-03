"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NavItem } from "@/content/site";

type MobileMenuProps = {
  nav: readonly NavItem[];
};

const MENU_OPEN_CLASS = "mobile-menu-open";

function setMenuScrollLock(locked: boolean) {
  document.documentElement.classList.toggle(MENU_OPEN_CLASS, locked);
  document.body.classList.toggle(MENU_OPEN_CLASS, locked);
}

export function MobileMenu({ nav }: MobileMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const prevPathname = useRef(pathname);

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    setMenuScrollLock(open);
    return () => setMenuScrollLock(false);
  }, [open]);

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

  const navigate = useCallback(
    (href: string) => {
      closeMenu();
      if (href === pathname) return;
      router.push(href);
    },
    [closeMenu, pathname, router],
  );

  const menuPanel = open ? (
    <div
      className="mobile-menu-root fixed inset-0 z-[200] flex max-lg:flex lg:hidden"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[var(--earth)]/40"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={closeMenu}
      />
      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="mobile-menu-panel relative z-[1] flex h-full min-h-0 w-full flex-col bg-[var(--cream)] shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="symbol-band h-0.5 shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-center justify-between border-b border-subtle px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <p id={titleId} className="font-display text-xl font-medium">
            Menu
          </p>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-sm px-3 text-sm font-semibold text-[var(--rasta-green)] outline-none active:text-[var(--rasta-red)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
            onClick={closeMenu}
          >
            Close
          </button>
        </div>
        <nav className="mobile-menu-nav flex min-h-0 flex-1 flex-col gap-1 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]" aria-label="Mobile">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-sm px-3 py-4 text-base font-medium leading-snug text-earth no-underline outline-none active:bg-surface-muted focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2"
              onClick={(event) => {
                event.preventDefault();
                navigate(item.href);
              }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/contact"
            className="btn btn-primary mx-0 mt-4 w-full no-underline"
            onClick={(event) => {
              event.preventDefault();
              navigate("/contact");
            }}
          >
            Contact
          </a>
        </nav>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm border border-subtle text-earth outline-none active:border-[var(--rasta-green)] active:text-[var(--rasta-green)] focus-visible:ring-2 focus-visible:ring-[var(--rasta-gold)] focus-visible:ring-offset-2 lg:hidden motion-reduce:transition-none"
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </span>
      </button>

      {mounted && menuPanel ? createPortal(menuPanel, document.body) : null}
    </>
  );
}
