import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Bucket List Drop — One Dream. One Drop. One Ocean.",
  description: "Add your dreams to a shared global ocean. Every bucket list becomes one drop.",
  openGraph: { title: "Bucket List Drop", description: "One dream is one drop. Together, we become an ocean.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={nunito.variable}><body>{children}</body></html>;
}
