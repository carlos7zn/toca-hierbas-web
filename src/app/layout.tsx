import { cn } from '@/lib/utils';
import { inter, robotoMono, spaceGrotesk } from '@/lib/fonts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarnings>
      <body
        className={cn(
          'min-h-screen bg-background text-text-primary antialiased',
          inter.variable,
          robotoMono.variable,
          spaceGrotesk.variable,
          'font-sans'
        )}
      >
        {children}
      </body>
    </html>
  );
}