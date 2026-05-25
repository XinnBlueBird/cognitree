import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CogniTree — Reasoning Tree Visualizer",
  description:
    "Decompose any LLM response into a hierarchical reasoning tree. Spot logical fallacies, weak premises, and reasoning gaps at a glance.",
  openGraph: {
    title: "CogniTree — Reasoning Tree Visualizer",
    description:
      "Decompose any LLM response into a hierarchical reasoning tree.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#070912] text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
