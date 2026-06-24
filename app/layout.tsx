import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dental Lead Tracker",
  description: "Outreach tracker for Kathmandu-valley dental clinics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
