import { FormEvent, useState } from 'react';
import { LockKeyhole, Pencil, ShieldCheck, Trash2, Trophy, X } from 'lucide-react';

import { Participant } from '@/entities/participant/types';

type AdminPanelProps = {
  participants: Participant[];
  isLoading: boolean;
  isLocked: boolean;
  isSupabaseReady: boolean;
  error: string;
  addParticipant: (name: string) => Promise<void>;
  renameParticipant: (id: string, name: string) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  runDraw: () => Promise<void>;
  resetTournament: () => Promise<void>;
};

export function AdminPanel({ participants, isLoading, isLocked, isSupabaseReady, error, addParticipant, renameParticipant, deleteParticipant, runDraw, resetTournament }: AdminPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsModalOpen(false);
      setPassword('');
      setMessage('');
      return;
    }

    setMessage('Неверный пароль администратора.');
  };

  const runAdminAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      setMessage(successMessage);
    } catch (actionError) {
      setMessage(actionError instanceof Error ? actionError.message : 'Не удалось выполнить действие.');
    }
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAdminAction(async () => {
      await addParticipant(adminName);
      setAdminName('');
    }, 'Участник добавлен.');
  };

  const handleRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    void runAdminAction(async () => {
      await renameParticipant(editingId, editingName);
      setEditingId(null);
      setEditingName('');
    }, 'Имя участника изменено.');
  };

  return (
    <section className="rounded-[18px] bg-white p-6 shadow-[0_18px_55px_rgba(93,60,132,0.12)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#B8A4E3]/25 text-[#7A4FA0]">
            <LockKeyhole size={24} />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B8A4E3]">Раздел 3</p>
            <h2 className="text-2xl font-bold text-[#5D3C84]">Админка</h2>
          </div>
        </div>
        {!isAdmin ? (
          <button className="rounded-[18px] bg-[#5D3C84] px-5 py-3 font-bold text-white shadow-[0_12px_30px_rgba(93,60,132,0.24)] transition hover:-translate-y-0.5 hover:bg-[#7A4FA0]" type="button" onClick={() => setIsModalOpen(true)}>
            Войти как администратор
          </button>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-6 grid gap-5 rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] p-5">
          <div className="flex items-center gap-3 font-bold text-[#2F8F78]">
            <ShieldCheck size={22} />
            Панель администратора
          </div>

          {error ? <p className="rounded-[18px] bg-red-100 p-4 font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="rounded-[18px] bg-white p-4 font-semibold text-[#7A4FA0]">{message}</p> : null}
          {isLoading ? <p className="font-semibold text-[#7A4FA0]">Загружаем данные турнира...</p> : null}

          {isLocked ? (
            <div className="rounded-[18px] bg-amber-100 p-4 font-semibold text-amber-700">Жеребьевка проведена. Добавление, удаление и переименование участников заблокированы.</div>
          ) : (
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAdd}>
              <input className="min-w-0 flex-1 rounded-[18px] border border-[#ECEAF1] bg-white px-4 py-3 text-[#5D3C84] outline-none transition focus:border-[#B8A4E3] focus:ring-4 focus:ring-[#B8A4E3]/20" value={adminName} onChange={(event) => setAdminName(event.target.value)} placeholder="Имя нового участника" disabled={!isSupabaseReady} />
              <button className="rounded-[18px] bg-[#2F8F78] px-5 py-3 font-bold text-white transition hover:bg-[#287966] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={!isSupabaseReady}>Добавить</button>
            </form>
          )}

          <div className="grid gap-3">
            {participants.map((participant) => (
              <div key={participant.id} className="rounded-[18px] bg-white p-4 shadow-[0_10px_28px_rgba(93,60,132,0.08)]">
                {editingId === participant.id ? (
                  <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleRename}>
                    <input className="min-w-0 flex-1 rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] px-4 py-3 font-bold text-[#5D3C84] outline-none" value={editingName} onChange={(event) => setEditingName(event.target.value)} />
                    <button className="rounded-[18px] bg-[#2F8F78] px-4 py-3 font-bold text-white" type="submit">Сохранить</button>
                    <button className="rounded-[18px] bg-[#ECEAF1] px-4 py-3 font-bold text-[#7A4FA0]" type="button" onClick={() => setEditingId(null)}>Отмена</button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-bold text-[#5D3C84]">{participant.name}</span>
                    {!isLocked ? (
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-2 rounded-[14px] bg-[#ECEAF1] px-3 py-2 font-bold text-[#7A4FA0]" type="button" onClick={() => { setEditingId(participant.id); setEditingName(participant.name); }}><Pencil size={16} />Изменить</button>
                        <button className="inline-flex items-center gap-2 rounded-[14px] bg-red-100 px-3 py-2 font-bold text-red-600" type="button" onClick={() => void runAdminAction(() => deleteParticipant(participant.id), 'Участник удален.')}><Trash2 size={16} />Удалить</button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isLocked ? <button className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-[#5D3C84] px-5 py-3 font-bold text-white transition hover:bg-[#7A4FA0]" type="button" onClick={() => void runAdminAction(runDraw, 'Жеребьевка проведена.')}><Trophy size={18} />Провести жеребьевку</button> : null}
            <button className="rounded-[18px] bg-red-500 px-5 py-3 font-bold text-white transition hover:bg-red-600" type="button" onClick={() => void runAdminAction(resetTournament, 'Турнир полностью сброшен.')}>Полный сброс турнира</button>
          </div>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#5D3C84]/35 p-5 backdrop-blur-sm">
          <form className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-[0_28px_90px_rgba(93,60,132,0.24)]" onSubmit={handleLogin}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-[#5D3C84]">Вход администратора</h3>
              <button className="rounded-full bg-[#ECEAF1] p-2 text-[#7A4FA0]" type="button" onClick={() => setIsModalOpen(false)} aria-label="Закрыть окно входа"><X size={20} /></button>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#7A4FA0]">Пароль<input className="rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] px-4 py-3 text-[#5D3C84] outline-none transition focus:border-[#B8A4E3] focus:ring-4 focus:ring-[#B8A4E3]/20" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" /></label>
            {message ? <p className="mt-3 font-semibold text-red-500">{message}</p> : null}
            <button className="mt-5 w-full rounded-[18px] bg-[#2F8F78] px-5 py-3 font-bold text-white transition hover:bg-[#287966]" type="submit">Войти</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
