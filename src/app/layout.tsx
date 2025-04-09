import './globals.css';
import type { Metadata } from 'next';
import EmotionRegistry from './emotion';
import MuiProvider from '../components/MuiProvider';

export const metadata: Metadata = {
  title: 'MUI + Emotion + Next.js SSR',
  description: 'No flash of unstyled content!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <MuiProvider>
            {children}
          </MuiProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
