import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Le font
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
// Le font
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Le metadata
export const metadata: Metadata = {
  title: "FPS Game",
  description:
    "FPS game wip for sockathon",
};

// Le layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Return the Hyper Text Markup Language
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
