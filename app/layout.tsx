import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Ruang Belajar AI — Belajar dari materimu, lebih terarah',
  description: 'Platform belajar cerdas untuk pelajar Indonesia: ubah materi belajar menjadi ringkasan, flashcard, kuis interaktif, dan mind map visual.',
  openGraph: {
    title: 'Ruang Belajar AI — Belajar dari materimu, lebih terarah',
    description: 'Platform belajar cerdas untuk pelajar Indonesia: ubah materi belajar menjadi ringkasan, flashcard, kuis interaktif, dan mind map visual.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ruang Belajar AI — Belajar dari materimu, lebih terarah',
    description: 'Platform belajar cerdas untuk pelajar Indonesia: ubah materi belajar menjadi ringkasan, flashcard, kuis interaktif, dan mind map visual.',
  },
  icons: {
    icon: '/assets/logo.jpg',
    apple: '/assets/logo.jpg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
