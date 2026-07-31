"use client";

/**
 * Catches errors thrown by the root layout itself. This replaces the entire root layout when it
 * fires, so it must render its own <html> and <body> — RootShell, globals.css, and the
 * next/font variables from app/layout.tsx may not be available. Everything here is inline/self
 * contained on purpose: no imports from components/ or content/, no Tailwind utility classes, no
 * external fonts. Kept legible in both light and dark via a plain embedded <style> + a media
 * query, since inline style props can't express prefers-color-scheme.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
        <style>{`
          .ge-body {
            margin: 0;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background-color: #faf7f0;
            color: #2a2218;
            font-family: Georgia, "Times New Roman", serif;
          }
          .ge-card {
            max-width: 28rem;
            text-align: center;
          }
          .ge-eyebrow {
            margin: 0;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #17633a;
          }
          .ge-title {
            margin: 1rem 0 0;
            font-size: 1.75rem;
            font-weight: 500;
            line-height: 1.2;
          }
          .ge-lead {
            margin-top: 1rem;
            line-height: 1.6;
            color: #5c4f3a;
          }
          .ge-actions {
            margin-top: 1.5rem;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .ge-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 2.75rem;
            padding: 0.625rem 1.5rem;
            border-radius: 0.25rem;
            border: none;
            background-color: #17633a;
            color: #fffdf8;
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .ge-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 2.75rem;
            padding: 0.625rem 1.5rem;
            border-radius: 0.25rem;
            border: 1px solid #17633a;
            color: #17633a;
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            text-decoration: none;
          }
          .ge-digest {
            margin-top: 1.5rem;
            font-size: 0.75rem;
            color: #8a7a62;
          }
          @media (prefers-color-scheme: dark) {
            .ge-body {
              background-color: #17130f;
              color: #f3efe6;
            }
            .ge-eyebrow {
              color: #35b477;
            }
            .ge-lead {
              color: #cfc3ab;
            }
            .ge-button {
              background-color: #2c8c57;
              color: #14110d;
            }
            .ge-link {
              border-color: #35b477;
              color: #35b477;
            }
            .ge-digest {
              color: #9c8f78;
            }
          }
        `}</style>
      </head>
      <body className="ge-body">
        <div className="ge-card">
          <p className="ge-eyebrow">Iron Lion Fitness &amp; Holistic Healing</p>
          <h1 className="ge-title">Something went wrong</h1>
          <p className="ge-lead">This wasn&rsquo;t your fault. Please try again in a moment.</p>
          <div className="ge-actions">
            <button type="button" onClick={() => reset()} className="ge-button">
              Try again
            </button>
            {/* Plain anchor, not next/link: this file replaces the whole app shell, including the
                router — a full page load back to "/" is the safe recovery path here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see comment above */}
            <a href="/" className="ge-link">
              Back to home
            </a>
          </div>
          {error.digest ? <p className="ge-digest">Error reference: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
