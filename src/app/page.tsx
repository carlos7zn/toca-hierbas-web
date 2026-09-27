'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

export default function Home() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <main>
      <div ref={ref}>
        <HeroSection />
        <FeaturesSection />
        <CommunitySection />
      </div>
    </main>
  );
}