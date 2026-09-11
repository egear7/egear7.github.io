import type { Metadata, Viewport } from "next";
import { Oswald, Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ege'nin Challenge'ları | FC27 Yayın Takip",
  description:
    "FC27 subathon yayını için canlı challenge ve konuk takip sistemi.",
  applicationName: "FC27 Yayın Takip",
};

export const viewport: Viewport = {
  themeColor: "#0a1a3d",
  width: "device-width",
  initialScale: 1,
};

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://api.github.com https://cdn.jsdelivr.net https://raw.githubusercontent.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${rajdhani.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <meta
          httpEquiv="Content-Security-Policy"
          content={csp}
        />
        {children}
      </body>
    </html>
  );
}