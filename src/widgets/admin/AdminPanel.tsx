import { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck, X } from 'lucide-react';

export function AdminPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsModalOpen(false);
      setPassword('');
      setError('');
      return;
    }

    setError('Неверный пароль администратора.');
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
          <button
            className="rounded-[18px] bg-[#5D3C84] px-5 py-3 font-bold text-white shadow-[0_12px_30px_rgba(93,60,132,0.24)] transition hover:-translate-y-0.5 hover:bg-[#7A4FA0]"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Войти как администратор
          </button>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-6 rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] p-5">
          <div className="flex items-center gap-3 font-bold text-[#2F8F78]">
            <ShieldCheck size={22} />
            Панель администратора
          </div>
          <p className="mt-2 text-[#7A4FA0]">Интерфейс готов. Управляющая логика будет добавлена позже.</p>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#5D3C84]/35 p-5 backdrop-blur-sm">
          <form className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-[0_28px_90px_rgba(93,60,132,0.24)]" onSubmit={handleLogin}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-[#5D3C84]">Вход администратора</h3>
              <button className="rounded-full bg-[#ECEAF1] p-2 text-[#7A4FA0]" type="button" onClick={() => setIsModalOpen(false)} aria-label="Закрыть окно входа">
                <X size={20} />
              </button>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#7A4FA0]">
              Пароль
              <input
                className="rounded-[18px] border border-[#ECEAF1] bg-[#F8F6FB] px-4 py-3 text-[#5D3C84] outline-none transition focus:border-[#B8A4E3] focus:ring-4 focus:ring-[#B8A4E3]/20"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введите пароль"
              />
            </label>
            {error ? <p className="mt-3 font-semibold text-red-500">{error}</p> : null}
            <button className="mt-5 w-full rounded-[18px] bg-[#2F8F78] px-5 py-3 font-bold text-white transition hover:bg-[#287966]" type="submit">
              Войти
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
