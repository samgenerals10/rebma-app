import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "REBMA IMPEX - Operational Management System",
  description: "Complete enterprise management platform for REBMA IMPEX Ghana",
  icons: {
    icon: "/rebma-logo.png",
    apple: "/rebma-logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialConfig = {
    theme: 'google-drive',
    palette: 'rebma',
    animation: 'smooth',
    darkMode: false,
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('theme, color_palette, animation_style, dark_mode')
        .eq('id', user.id)
        .single()

      if (profile) {
        initialConfig = {
          theme: profile.theme || 'google-drive',
          palette: profile.color_palette || 'rebma',
          animation: profile.animation_style || 'smooth',
          darkMode: profile.dark_mode || false,
        }
      }
    }
  } catch (e) {
    // Not logged in — use defaults
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-theme={initialConfig.theme}
      data-palette={initialConfig.palette}
      data-animation={initialConfig.animation}
    >
      <head>
        <link rel="icon" href="/rebma-logo.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider initialConfig={initialConfig}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
