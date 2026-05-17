import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discipline Pro - Your Personal Focus Assistant",
  description: "Build discipline, track habits, and achieve your goals daily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
