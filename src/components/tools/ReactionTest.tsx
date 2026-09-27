import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { saveReflexScore, getTopReflexScores, getUserBestReflexScore } from '@/lib/db/queries';
import { useToast } from '@/components/ui/use-toast';

const MAX_REACTION_TIME = 500; // ms
const MIN_REACTION_TIME = 100; // ms

export default function ReactionTest() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [state, setState] = useState<'ready' | 'running' | 'finished'>('ready');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userScores, setUserScores] = useState<{
    userName: string;
    reactionTime: number;
    createdAt: Date;
  }[]>([]);
  const [topScores, setTopScores] = useState<{
    userName: string;
    reactionTime: number;
  }[]>([]);

  // Generate random sequence on state change
  useEffect(() => {
    if (state === 'ready') {
      const newSequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 5) + 1);
      setSequence(newSequence);
      setCurrentStep(0);
      setProgress(0);
      setReactionTime(null);
    }
  }, [state]);

  // Fetch scores when session changes
  useEffect(() => {
    const fetchScores = async () => {
      if (session?.user?.id) {
        try {
          const userBest = await getUserBestReflexScore(session.user.id);
          const top = await getTopReflexScores(10);
          if (userBest) {
            setUserScores([userBest]);
          }
          setTopScores(top);
        } catch (error) {
          console.error('Error fetching scores:', error);
        }
      }
    };
    fetchScores();
  }, [session]);

  const startTest = () => {
    setState('running');
    const totalDuration = sequence.reduce((acc, step) => acc + step * 1000, 0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, totalDuration / 100);

    let timeAcc = 0;
    sequence.forEach((step, index) => {
      const timeoutId = setTimeout(() => {
        if (index === 0) {
          // Start timing on first light
          const startTime = Date.now();
          document.addEventListener('click', handleClick);
        }
        if (index === sequence.length - 1) {
          // Last light turns off
          setTimeout(() => {
            document.removeEventListener('click', handleClick);
            setState('finished');
          }, step * 1000);
        }
      }, timeAcc);
      timeAcc += step * 1000;
    });
  };

  const handleClick = () => {
    if (state === 'running') {
      const endTime = Date.now();
      const rt = endTime - startTime;
      setReactionTime(rt);
      setState('finished');
      document.removeEventListener('click', handleClick);
    }
  };

  const handleSave = async () => {
    if (!session?.user || !reactionTime) return;
    
    try {
      await saveReflexScore({
        userId: session.user.id,
        userName: session.user.name || 'Anonymous',
        userAvatar: session.user.image || null,
        reactionTime,
      });
      toast({
        title: 'Récord guardado!',
        description: `Tu tiempo de reacción de ${reactionTime}ms ha sido registrado.`,
      });
      // Refresh user scores
      const userBest = await getUserBestReflexScore(session.user.id);
      if (userBest) {
        setUserScores([userBest]);
      }
    } catch (error) {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo guardar tu récord. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card variant="neon" className="max-w-lg w-full mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="w-6 h-6 bg-neon-cyan rounded-full shadow-neon-cyan"
          />
          Test de Reflejos
        </CardTitle>
        <p className="text-text-secondary mt-2">
          Haz clic lo más rápido posible cuando las luces se apaguen. ¡Concentra tu vibecoding!
        </p>
      </CardHeader>
      <Separator orientation="horizontal" className="mx-6" />
      <CardContent className="py-6">
        <div className="grid grid-cols-5 gap-4">
          {sequence.map((_, index) => (
            <motion.div
              key={index}
              className="w-full pt-[100%] relative rounded-full bg-surface-tertiary overflow-hidden"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: state === 'running' && index < currentStep ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-neon-cyan shadow-neon-cyan"
                initial={{ opacity: 0 }}
                animate={{ opacity: state === 'running' && index === currentStep ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </div>
        {state === 'running' && (
          <motion.div
            className="mt-6 h-2 bg-surface-tertiary rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: (sequence.reduce((a, b) => a + b, 0) / 1000), ease: 'linear' }}
          >
            <motion.div
              className="h-full bg-neon-cyan shadow-neon-cyan"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </motion.div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {state === 'ready' && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={startTest}
          >
            Iniciar Test
          </Button>
        )}
        {state === 'finished' && reactionTime !== null && (
          <>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-neon-cyan">{reactionTime}ms</h3>
              <p className="text-text-secondary mt-1">
                {reactionTime < 200 ? '🤯 Vibecode Maestro!' : reactionTime < 300 ? '👌 Nada mal!' : '🙃 Sigue practicando'}
              </p>
            </div>
            {session ? (
              <Button
                variant="neon"
                size="lg"
                className="w-full"
                onClick={handleSave}
              >
                Guardar Récord
              </Button>
            ) : (
              <p className="text-text-secondary text-center">
                Inicia sesión con Discord para guardar tu récord.
              </p>
            )}
          </>
        )}
        <Separator orientation="horizontal" className="my-4" />
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-text-primary">Mejores Récords</h4>
          {topScores.length > 0 ? (
            <div className="space-y-2">
              {topScores.map((score, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-text-secondary">{score.userName}</span>
                  <Badge variant="neon">{score.reactionTime}ms</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">Aún no hay récords. ¡Sé el primero!</p>
          )}
        </div>
        {userScores.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-primary">Tu Mejor Récord</h4>
            <div className="space-y-2">
              {userScores.map((score, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-text-secondary">Tu mejor tiempo</span>
                  <Badge variant="neon">{score.reactionTime}ms</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}