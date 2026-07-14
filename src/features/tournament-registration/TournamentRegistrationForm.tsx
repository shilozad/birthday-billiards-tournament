import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from '@/shared/api/supabase';

const registrationSchema = z.object({
  name: z.string().min(2, 'Введите минимум 2 символа'),
  nickname: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function TournamentRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: '', nickname: '' },
  });

  const registerPlayer = useMutation({
    mutationFn: async (values: RegistrationFormValues) => {
      if (!supabase) {
        return values;
      }

      const { error } = await supabase.from('tournament_registrations').insert(values);

      if (error) {
        throw error;
      }

      return values;
    },
    onSuccess: () => reset(),
  });

  return (
    <motion.form
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      onSubmit={handleSubmit((values) => registerPlayer.mutate(values))}
    >
      <label className="grid gap-2 text-sm font-medium text-slate-200">
        Имя игрока
        <input
          className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-felt/60 transition focus:ring-4"
          placeholder="Алексей"
          {...register('name')}
        />
        {errors.name ? <span className="text-rose-300">{errors.name.message}</span> : null}
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-200">
        Никнейм
        <input
          className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none ring-felt/60 transition focus:ring-4"
          placeholder="8-ball wizard"
          {...register('nickname')}
        />
      </label>

      <button
        className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={registerPlayer.isPending}
        type="submit"
      >
        {registerPlayer.isPending ? 'Регистрируем...' : 'Записаться на турнир'}
      </button>
    </motion.form>
  );
}
