import { inter, robotoMono, spaceGrotesk } from '@/lib/fonts';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={
          'min-h-screen bg-background text-text-primary antialiased ' +
          inter.variable + ' ' + robotoMono.variable + ' ' + spaceGrotesk.variable
        }
      >
        {children}
      </body>
    </html>
  );
}