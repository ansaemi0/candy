import type { Metadata } from "next";
import { Cinzel_Decorative, Orbitron } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel_Decorative({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const orbitron = Orbitron({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Lucky Roulette - Casino",
  description: "카지노 스타일 룰렛 게임",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${cinzel.variable} ${orbitron.variable}`}>
        {children}
      </body>
    </html>
  );
}
