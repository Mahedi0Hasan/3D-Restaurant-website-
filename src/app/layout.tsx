import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smokehouse 1986 — Oak-Smoked Burgers & BBQ",
  description:
    "Dry-aged smash burgers and 14-hour post-oak brisket since 1986. Order online for delivery or pickup. A SmartOrder BD 3D restaurant demo.",
  openGraph: {
    title: "Smokehouse 1986 — Smoked low. Served bold.",
    description: "Oak-smoked burgers & BBQ. Order online for delivery or pickup.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0907",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="grain">{children}</body>
    </html>
  );
}
