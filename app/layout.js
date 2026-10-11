import './globals.css'
import { DynaPuff, Nunito } from 'next/font/google'
const display = DynaPuff({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-display' })
const body = Nunito({ subsets: ['latin'], variable: '--font-body' })
export const metadata = { title: 'A birthday wish for you', description: 'Blow out the candles.' }
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#140B2B' }
export default function RootLayout({ children }) {
  return (<html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>)
}
