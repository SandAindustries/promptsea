import './globals.css'
import Header from '@/components/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PromptSea',
  description: 'AI 프롬프트 공유 커뮤니티',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}