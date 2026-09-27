import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function HeroSection() {
  const { data: session } = useSession();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary font-display leading-tight mb-4">
            <span className="inline-block relative">
              Bienvenido a Toca Hierbas
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-neon-cyan w-full origin-bottom-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-8">
            La comunidad definitiva para Sim Racing, Modding y Vibecoding. Donde Bad Kefir y Devilyogurt se enfrentan en el lore, pero nosotros creamos.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/tools">Explorar Herramientas</Link>
            </Button>
            <Button variant="neon" size="lg" asChild>
              <Link href="/gallery">Ver Galería</Link>
            </Button>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 bg-mesh-gradient opacity-50"
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-neon" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-neon-magenta/10 rounded-full blur-3xl animate-pulse-neon" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl animate-pulse-neon" />
      </motion.div>
    </section>
  );
}