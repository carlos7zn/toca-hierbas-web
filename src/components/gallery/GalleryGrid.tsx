import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { mockGalleryImages } from '@/lib/mock-data';

export default function GalleryGrid() {
  return (
    <Card variant="neon" className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 bg-neon-cyan rounded-full shadow-neon-cyan"
          />
          Galería de Capturas
        </CardTitle>
      </CardHeader>
      <Separator orientation="horizontal" className="mx-6" />
      <CardContent className="py-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {mockGalleryImages.map((image) => (
            <motion.div
              key={image.id}
              className="break-inside-avoid mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative group rounded-2xl overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white text-lg md:text-xl font-bold">{image.title}</h3>
                  <p className="text-white/80 text-sm md:text-base line-clamp-2">{image.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Image
                      src={image.authorAvatar || ''}
                      alt={image.authorName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-neon-cyan/30"
                    />
                    <span className="text-white/80 text-sm">{image.authorName}</span>
                    <Badge variant="game" game={image.game} size="sm" className="ml-auto">
                      {image.game && GAME_LABELS[image.game]}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}