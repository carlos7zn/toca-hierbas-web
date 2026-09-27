import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { motion } from 'framer-motion';
import Image from 'next/image';

const features = [
  {
    title: 'Test de Reflejos',
    description: 'Mide tu tiempo de reacción con un minijuego interactivo. ¿Podrás batir el récord de la comunidad?',
    icon: '⏱️',
    href: '/tools#reflex-test',
  },
  {
    title: 'Calculadora de Combustible',
    description: 'Optimiza tu estrategia de carrera con cálculos precisos de consumo para Sim Racing.',
    icon: '⛽',
    href: '/tools#fuel-calculator',
  },
  {
    title: 'Galería de Capturas',
    description: 'Comparte y descubre las mejores capturas de la comunidad. Solo para miembros de Discord.',
    icon: '🖼️',
    href: '/gallery',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-display">
            Herramientas y Contenido
          </h2>
          <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">
            Desde utilidades prácticas hasta entretenimiento, todo diseñado para la comunidad.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="glass"
              className="hover:bg-surface-hover transition-colors"
              asChild
            >
              <a href={feature.href} target="_blank" rel="noopener noreferrer">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-surface rounded-full">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <CardTitle className="text-left">{feature.title}</CardTitle>
                </CardHeader>
                <Separator orientation="horizontal" className="mx-6" />
                <CardContent className="text-text-secondary">{feature.description}</CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}