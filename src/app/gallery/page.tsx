import { cn } from '@/lib/utils';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import UploadForm from '@/components/gallery/UploadForm';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function GalleryPage() {
  const { data: session } = useSession();

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <GalleryGrid />
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <UploadForm />
          </motion.div>
        )}
      </div>
    </div>
  );
}