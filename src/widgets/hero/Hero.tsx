import { motion } from 'framer-motion';
import { PartyPopper, Trophy } from 'lucide-react';

export function Hero() {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white p-8 shadow-[0_24px_80px_rgba(93,60,132,0.14)] sm:p-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-5">
          <motion.div
            className="flex w-fit items-center gap-2 rounded-full bg-[#ECEAF1] px-4 py-2 text-sm font-semibold text-[#7A4FA0]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PartyPopper size={18} />
            Birthday Billiards Tournament
          </motion.div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-[#5D3C84] sm:text-6xl">
            Турнирная сетка для праздничного бильярда
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[#7A4FA0]">
            Одностраничный интерфейс для регистрации участников, просмотра жеребьевки и входа в
            административную панель.
          </p>
        </div>
        <div className="hidden rounded-[18px] bg-[#B8A4E3]/20 p-6 text-[#7A4FA0] lg:block">
          <Trophy size={92} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  );
}
