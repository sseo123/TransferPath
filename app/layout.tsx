import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'TransferPath — Transfer Planning for Community College Students',
    template: '%s | TransferPath',
  },
  description: 'Plan your community college to UC transfer with an interactive, customizable course roadmap. Track IGETC requirements, compare universities, and stay on track.',
  keywords: ['transfer planning', 'community college', 'UC transfer', 'IGETC', 'articulation'],
  openGraph: {
    title: 'TransferPath — Transfer Planning Made Simple',
    description: 'Plan your community college to UC transfer with an interactive, customizable course roadmap.',
    url: 'https://yourdomain.com', //put the actual domain once you get the website
    siteName: 'TransferPath',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TransferPath',
    description: 'Plan your community college to UC transfer',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        {/* Cloudflare Web Analytics */}
        {/* <script
          defer
          src='https://static.cloudflareinsights.com/beacon.min.js'
          data-cf-beacon='{"token": "YOUR_CLOUDFLARE_ANALYTICS_TOKEN"}'
        /> */}
      </body>
    </html>
  );
}