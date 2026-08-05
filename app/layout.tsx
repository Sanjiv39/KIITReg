import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "K{devs} | KIIT Koding Club",
  description: "Official Tech Community & Coding Club of KIIT School of Computer Application. From cursor to creator.",
  keywords: ["Kdevs", "KIIT", "Coding Club", "Tech Community", "Software Development", "KIIT SCA"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.className} style={{ scrollBehavior: 'smooth' }}>
      <body className={`${spaceGrotesk.className} bg-[#0b0f19] text-white min-h-screen antialiased selection:bg-[#00f2fe]/30 selection:text-[#00f2fe]`}>
        {children}
      </body>
    </html>
  );
}
