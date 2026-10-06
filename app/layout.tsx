import type { Metadata } from "next";
import "./globals.css";
import "./living.css";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role}`,
  description: profile.summary,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
