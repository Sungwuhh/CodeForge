import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'CodeForge', description: 'A controlled browser coding workspace with an AI coding assistant.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
