import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="grid gap-6 text-center lg:text-left">
      <motion.p
        className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-300"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Birthday Billiards Tournament
      </motion.p>
      <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
        Турнир по бильярду для дня рождения
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-slate-300 lg:mx-0">
        Базовый React + TypeScript + Vite проект с TailwindCSS, React Query, React Hook Form, Framer
        Motion и Supabase.
      </p>
    </section>
  );
}
