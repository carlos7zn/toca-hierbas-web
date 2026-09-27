import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { mockUsers } from '@/lib/mock-data';

export default function CommunitySection() {
  return (
    <section className="py-16 md:py-24 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Badge variant="neon">Comunidad</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary font-display mt-4">
            Únete a la Vibecode
          </h2>
          <p className="text-lg text-text-secondary mt-4 max-w-3xl mx-auto">
            Conecta con otros apasionados del Sim Racing, Modding y Hardware. Comparte tus creaciones y aprende de los mejores.
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {mockUsers.map((user) => (
            <motion.div
              key={user.id}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-neon-cyan/30"
              />
              <span className="text-text-primary font-medium">{user.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}