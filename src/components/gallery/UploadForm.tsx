import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { saveGalleryImage } from '@/lib/db/queries';
import { useToast } from '@/components/ui/use-toast';
import { GameType } from '@/types';

const gameOptions: { value: GameType; label: string }[] = [
  { value: 'assetto-corsa', label: 'Assetto Corsa' },
  { value: 'acc', label: 'Assetto Corsa Competizione' },
  { value: 'beamng', label: 'BeamNG.drive' },
  { value: 'gta-v', label: 'GTA V' },
  { value: 'minecraft', label: 'Minecraft' },
  { value: 'other', label: 'Otro' },
];

export default function UploadForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'other' as GameType,
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !session?.user) return;

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('game', formData.game);
    formDataToSend.append('authorId', session.user.id);
    formDataToSend.append('authorName', session.user.name || 'Anonymous');
    formDataToSend.append('authorAvatar', session.user.image || '');

    try {
      await saveGalleryImage({
        url: '', // Will be filled by the server
        title: formData.title,
        description: formData.description,
        authorId: session.user.id,
        authorName: session.user.name || 'Anonymous',
        authorAvatar: session.user.image || null,
        game: formData.game,
        tags: [],
        likes: 0,
      });
      toast({
        title: '¡Captura subida!',
        description: 'Tu imagen ha sido añadida a la galería.',
      });
      setFile(null);
      setPreviewUrl(null);
      setFormData({ title: '', description: '', game: 'other' });
    } catch (error) {
      toast({
        title: 'Error al subir',
        description: 'No se pudo subir la imagen. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card variant="neon" className="max-w-lg w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 bg-neon-cyan rounded-full shadow-neon-cyan"
          />
          Subir Captura
        </CardTitle>
      </CardHeader>
      <Separator orientation="horizontal" className="mx-6" />
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed border-neon-cyan/30 rounded-2xl p-8 text-center cursor-pointer',
              'hover:bg-surface-hover transition-colors',
              isDragActive && 'bg-surface-hover'
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-neon-cyan">Suelta la imagen aquí...</p>
            ) : (
              <>
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 10 }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                  className="mx-auto w-12 h-12 bg-neon-cyan/10 rounded-full flex items-center justify-center mb-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-neon-cyan w-6 h-6"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </motion.div>
                <p className="text-text-secondary">
                  Arrastra y suelta una imagen o haz clic para seleccionar
                </p>
                <p className="text-neon-cyan mt-2">Formatos soportados: JPG, PNG, WEBP</p>
              </>
            )}
          </div>
          {previewUrl && (
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Mi mejor vuelta en Spa..."
          />
          <Textarea
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Detalles de la captura, configuración, etc."
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5 font-mono">
              Juego
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {gameOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={formData.game === option.value ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, game: option.value }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!file || !formData.title}
          >
            Subir Captura
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}