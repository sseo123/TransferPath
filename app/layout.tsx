import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'TransferPathway — You should be spending your time studying, not planning. Let TransferPathway save you the work.',
    template: '%s | TransferPathway',
  },
  description: 'Plan your community college to UC transfer with an interactive, customizable course roadmap. Track IGETC requirements, compare universities, and stay on track.',
  keywords: ['transfer planning', 'community college', 'UC transfer', 'IGETC', 'articulation'],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'TransferPathway — Transfer Planning Made Simple',
    description: 'Plan your community college to UC transfer with an interactive, customizable course roadmap.',
    url: 'https://transferpathway.com',
    siteName: 'TransferPathway',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TransferPathway',
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