import './globals.css'
import { Source_Sans_3 } from 'next/font/google'

const sourceSansPro = Source_Sans_3({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: 'Using WebGPU',
  description: 'An extensible web based gpu language/api',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={sourceSansPro.className}>{children}</body>
    </html>
  )
}
