import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import { Sidebar } from '@/components/Sidebar'
import ThemeRegistry from '@/lib/mui/ThemeRegistry'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kowabowa',
  description: 'Continuous work-achievement tracking, tied directly to performance review.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <ThemeRegistry>
          <AuthProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
