import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, UserPlus } from 'lucide-react';

export function TournamentRegistrationForm() {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const normalizedPlayers = useMemo(() => players.map((player) => player.toLowerCase()), [players]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setMessage('Введите имя участника.');
      return;
    }

    if (normalizedPlayers.includes(trimmedName.toLowerCase())) {
      setMessage('Участник с таким именем уже зарегистрирован.');
      return;
    }

    setPlayers((currentPlayers) => [...currentPlayers, trimmedName]);
    setName('');
    setMessage(`${trimmedName}, заявка принята!`);
  };

  return (
    <motion.section
      className="rounded-[18px] bg-white p-6 shadow-[0_18px_55px_rgba(93,60,132,0.12)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#B8A4E3]/25 text-[#7A4FA0]">
          <UserPlus size={24} />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B8A4E3]">Раздел 1</p>
          <h2 className="text-2xl font-bold text-[#5D3C84]">Регистрация участников</h2>
        </div>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold text-[#7A4FA0]">
          Имя
          <input
            className="rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] px-4 py-3 text-[#5D3C84] outline-none transition placeholder:text-[#B8A4E3] focus:border-[#B8A4E3] focus:ring-4 focus:ring-[#B8A4E3]/20"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Например, Алексей"
          />
        </label>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#2F8F78] px-5 py-3 font-bold text-white shadow-[0_12px_30px_rgba(47,143,120,0.24)] transition hover:-translate-y-0.5 hover:bg-[#287966]"
          type="submit"
        >
          <Send size={18} />
          Подать заявку
        </button>
      </form>

      {message ? (
        <div className="mt-5 flex items-start gap-3 rounded-[18px] bg-[#2F8F78]/10 p-4 font-semibold text-[#2F8F78]">
          <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
          <span>{message}</span>
        </div>
      ) : null}
    </motion.section>
  );
}
