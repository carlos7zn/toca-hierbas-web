import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Separator } from '@/components/ui/Separator';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

const fuelTypes = [
  { value: 'gasoline', label: 'Gasolina', density: 0.75 },
  { value: 'diesel', label: 'Diésel', density: 0.83 },
  { value: 'ethanol', label: 'Etanol E85', density: 0.71 },
] as const;

type FuelType = (typeof fuelTypes)[number]['value'];

interface FuelCalculationForm {
  raceTime: number;
  consumptionPerLap: number;
  lapTime: number;
  fuelType: FuelType;
  safetyMargin: number;
}

const defaultValues: FuelCalculationForm = {
  raceTime: 90,
  consumptionPerLap: 2.5,
  lapTime: 150,
  fuelType: 'gasoline',
  safetyMargin: 10,
};

export default function FuelCalculator() {
  const [formData, setFormData] = useState<FuelCalculationForm>(defaultValues);
  const [result, setResult] = useState<number | null>(null);

  const handleChange = (field: keyof FuelCalculationForm, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fuelDensity = fuelTypes.find((f) => f.value === formData.fuelType)?.density || 0.75;
    
    const totalFuelLiters = (
      (formData.raceTime / 60) *
      (formData.consumptionPerLap / formData.lapTime) *
      fuelDensity
    );
    
    const fuelWithMargin = totalFuelLiters * (1 + (formData.safetyMargin / 100));
    const recommendedFuel = Math.ceil(fuelWithMargin / 10) * 10;
    
    setResult(recommendedFuel);
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
          Calculadora de Combustible
        </CardTitle>
        <CardDescription>
          Calcula la cantidad de combustible necesaria para tu carrera. Valores por defecto: <strong>Toyota GR Supra GT4</strong>.
        </CardDescription>
      </CardHeader>
      <Separator orientation="horizontal" className="mx-6" />
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <Input
            type="number"
            label="Tiempo de carrera (minutos)"
            value={formData.raceTime}
            onChange={(e) => handleChange('raceTime', Number(e.target.value))}
            min={10}
            max={300}
            step={5}
          />
          <Input
            type="number"
            label="Consumo por vuelta (litros)"
            value={formData.consumptionPerLap}
            onChange={(e) => handleChange('consumptionPerLap', Number(e.target.value))}
            min={0.5}
            max={10}
            step={0.1}
          />
          <Input
            type="number"
            label="Tiempo por vuelta (segundos)"
            value={formData.lapTime}
            onChange={(e) => handleChange('lapTime', Number(e.target.value))}
            min={60}
            max={300}
            step={1}
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5 font-mono">
              Tipo de combustible
            </label>
            <div className="flex gap-2 flex-wrap">
              {fuelTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={formData.fuelType === type.value ? 'neon' : 'outline'}
                  size="sm"
                  onClick={() => handleChange('fuelType', type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          <Input
            type="number"
            label="Margen de seguridad (%)"
            value={formData.safetyMargin}
            onChange={(e) => handleChange('safetyMargin', Number(e.target.value))}
            min={0}
            max={50}
            step={1}
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant="neon" size="md">
            {result ? `${result} litros` : '...'}
          </Badge>
          <Button type="submit" variant="primary" size="lg">
            Calcular
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}