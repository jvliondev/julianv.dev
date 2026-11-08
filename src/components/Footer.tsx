import Link from "next/link";

export function Footer() {
  return <footer className="footer">
    <div className="footer-signature">
      <Link className="footer-wordmark" href="/" aria-label="JulianV.dev home">
        <span className="brand-mark" aria-hidden="true"><i/><i/></span>
        <span>julianv.dev</span>
      </Link>
      <span className="footer-divider" aria-hidden="true"/>
      <div className="footer-profile">
        <strong>Julian Vasquez</strong>
        <span>Product Builder / Software Engineer / Entrepreneur</span>
      </div>
    </div>
    <div className="footer-actions">
      <Link className="footer-contact" href="/contact" aria-label="Contact Julian Vasquez">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.5 5.5h17v13h-17z"/><path d="m4 6 8 7 8-7"/></svg>
        <span>Contact</span>
      </Link>
      <span className="footer-divider footer-actions-divider" aria-hidden="true"/>
      <nav className="footer-socials" aria-label="Social links">
        <a href="https://github.com/jvliondev" target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.93c.46.08.63-.2.63-.45v-1.6c-2.57.56-3.11-1.09-3.11-1.09-.42-1.07-1.03-1.36-1.03-1.36-.84-.57.07-.56.07-.56.93.07 1.42.96 1.42.96.83 1.42 2.18 1.01 2.71.77.08-.6.32-1.01.59-1.24-2.05-.23-4.21-1.02-4.21-4.55 0-1 .36-1.83.96-2.48-.1-.24-.42-1.18.09-2.45 0 0 .78-.25 2.53.95a8.76 8.76 0 0 1 4.61 0c1.75-1.2 2.53-.95 2.53-.95.51 1.27.19 2.21.09 2.45.6.65.96 1.48.96 2.48 0 3.54-2.16 4.32-4.22 4.55.33.28.63.84.63 1.7v2.42c0 .25.17.54.64.45A9.2 9.2 0 0 0 12 2.8Z"/></svg>
        </a>
        <a href="https://linkedin.com/in/julian-vasquez-1b12ba203" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5.2 8.6H2.4v12h2.8zm-1.4-1.7a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26Zm18 6.82c0-3.22-1.72-4.72-4.02-4.72a3.47 3.47 0 0 0-3.13 1.72V8.6h-2.8v12h2.8v-6.56c0-1.73.33-3.41 2.48-3.41 2.12 0 2.15 1.98 2.15 3.52v6.45h2.8Z"/></svg>
        </a>
        <a href="https://x.com/jvliondev" target="_blank" rel="noreferrer" aria-label="X">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18.9 2.8h3.1l-6.78 7.75L23.2 21.2h-6.1l-4.78-6.25-5.47 6.25H3.7l7.25-8.29L3.2 2.8h6.26l4.32 5.72Zm-1.08 16.5h1.72L8.64 4.6H6.79Z"/></svg>
        </a>
      </nav>
    </div>
  </footer>;
}
