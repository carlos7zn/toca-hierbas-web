import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 bg-neon-cyan rounded-full shadow-neon-cyan"
            />
            <span className="text-xl font-bold text-text-primary font-display">Toca Hierbas</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/tools">Herramientas</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/gallery">Galería</Link>
            </Button>
            {session ? (
              <Button variant="neon" size="sm" onClick={() => signOut()}>
                <Image
                  src={session.user.image || ''}
                  alt={session.user.name || 'User'}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full mr-2"
                />
                {session.user.name}
              </Button>
            ) : (
              <Button variant="neon" size="sm" onClick={() => signIn('discord')}>
                Iniciar sesión con Discord
              </Button>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
}