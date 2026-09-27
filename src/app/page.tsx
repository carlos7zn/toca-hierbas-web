'use client';

export const dynamic = 'force-dynamic';

import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection'; 
import CommunitySection from '@/components/home/CommunitySection';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useEffect, useState } from 'react';

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
