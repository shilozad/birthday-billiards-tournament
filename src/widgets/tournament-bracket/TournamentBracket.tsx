import { GitBranch, Sparkles } from 'lucide-react';

export function TournamentBracket() {
  return (
    <section className="rounded-[18px] bg-white p-6 shadow-[0_18px_55px_rgba(93,60,132,0.12)]">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#B8A4E3]/25 text-[#7A4FA0]">
          <GitBranch size={24} />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B8A4E3]">Раздел 2</p>
          <h2 className="text-2xl font-bold text-[#5D3C84]">Турнирная сетка</h2>
        </div>
      </div>

      <div className="grid min-h-72 place-items-center rounded-[18px] border border-dashed border-[#B8A4E3] bg-[#F8F6FB] p-8 text-center">
        <div className="grid max-w-sm justify-items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#B8A4E3] shadow-[0_12px_30px_rgba(93,60,132,0.10)]">
            <Sparkles size={30} />
          </span>
          <h3 className="text-2xl font-bold text-[#5D3C84]">Жеребьевка еще не проведена</h3>
          <p className="text-[#7A4FA0]">После жеребьевки здесь появится аккуратная сетка матчей.</p>
        </div>
      </div>
    </section>
  );
}
