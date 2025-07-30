import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LeadCrush - 小红书线索挖掘系统",
  description: "基于小红书真实数据的AI智能线索挖掘系统",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}
