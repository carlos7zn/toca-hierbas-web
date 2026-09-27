import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { motion } from 'framer-motion';
import ReactionTest from '@/components/tools/ReactionTest';
import FuelCalculator from '@/components/tools/FuelCalculator';

export default function ToolsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <section id="reflex-test">
          <ReactionTest />
        </section>
        <Separator orientation="horizontal" className="my-8" />
        <section id="fuel-calculator">
          <FuelCalculator />
        </section>
      </div>
    </div>
  );
}