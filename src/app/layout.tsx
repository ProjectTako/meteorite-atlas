import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meteorite Atlas — 45,000 falls, one honest map",
  description:
    "An interactive explorer for NASA's meteorite landings dataset, with a clear-eyed look at where the data really comes from.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Spline+Sans:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
