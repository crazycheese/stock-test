'use client';

import React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../lib/emotionCache';

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const cache = React.useMemo(() => createEmotionCache(), []);
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
