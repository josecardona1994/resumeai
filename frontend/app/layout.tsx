import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResumeAI — Your resume, always up to date",
  description: "AI-powered resume generator with LinkedIn sync. Update once, generate anywhere.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <html lang="en">
        <body className={`${inter.className} min-h-screen`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
