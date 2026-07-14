import { GitBranch, Sparkles } from 'lucide-react';

import { Participant } from '@/entities/participant/types';
import { BracketKind, TournamentMatch } from '@/entities/tournament/model/doubleElimination';

type TournamentBracketProps = {
  isLocked: boolean;
  participants: Participant[];
  matches: TournamentMatch[];
  selectMatchWinner: (matchId: string, winnerId: string) => Promise<void>;
};

const bracketTitles: Record<BracketKind, string> = {
  winners: 'Upper Bracket',
  losers: 'Lower Bracket',
  final: 'Grand Final',
};

const bracketOrder: BracketKind[] = ['winners', 'losers', 'final'];

export function TournamentBracket({
  isLocked,
  matches,
  participants,
  selectMatchWinner,
}: TournamentBracketProps) {
  const participantNames = new Map(
    participants.map((participant) => [participant.id, participant.name]),
  );
  const getName = (id: string | null) => (id ? (participantNames.get(id) ?? 'Участник') : 'TBD');

  const renderPlayer = (match: TournamentMatch, playerId: string | null) => {
    const isWinner = playerId && match.winner_id === playerId;
    return (
      <button
        className={`w-full rounded-[14px] px-3 py-2 text-left font-bold transition ${isWinner ? 'bg-[#2F8F78] text-white' : 'bg-[#F8F6FB] text-[#5D3C84]'} disabled:cursor-not-allowed disabled:opacity-60`}
        type="button"
        disabled={!playerId || match.status !== 'ready'}
        onClick={() => playerId && void selectMatchWinner(match.id, playerId)}
      >
        {getName(playerId)}
      </button>
    );
  };

  return (
    <section className="rounded-[18px] bg-white p-6 shadow-[0_18px_55px_rgba(93,60,132,0.12)]">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-[#B8A4E3]/25 text-[#7A4FA0]">
          <GitBranch size={24} />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#B8A4E3]">
            Раздел 2
          </p>
          <h2 className="text-2xl font-bold text-[#5D3C84]">Турнирная сетка</h2>
        </div>
      </div>

      <div className="grid min-h-72 rounded-[18px] border border-dashed border-[#B8A4E3] bg-[#F8F6FB] p-6">
        {isLocked && matches.length > 0 ? (
          <div className="grid gap-6">
            <div>
              <h3 className="text-2xl font-bold text-[#5D3C84]">Double Elimination</h3>
              <p className="text-[#7A4FA0]">
                Выберите победителя в готовых матчах. Проигравший из Upper автоматически переходит в
                Lower, Grand Final проводится один раз.
              </p>
            </div>

            {bracketOrder.map((bracket) => {
              const bracketMatches = matches.filter((match) => match.bracket === bracket);
              if (bracketMatches.length === 0) return null;
              const rounds = [...new Set(bracketMatches.map((match) => match.round))].sort(
                (a, b) => a - b,
              );

              return (
                <div key={bracket} className="grid gap-3">
                  <h4 className="text-xl font-black text-[#5D3C84]">{bracketTitles[bracket]}</h4>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {rounds.map((round) => (
                      <div
                        key={`${bracket}-${round}`}
                        className="rounded-[18px] bg-white p-4 shadow-[0_10px_28px_rgba(93,60,132,0.08)]"
                      >
                        <p className="mb-3 font-black text-[#7A4FA0]">
                          {bracket === 'final' ? 'Grand Final' : `Раунд ${round}`}
                        </p>
                        <div className="grid gap-3">
                          {bracketMatches
                            .filter((match) => match.round === round)
                            .sort((a, b) => a.position - b.position)
                            .map((match) => (
                              <div
                                key={match.id}
                                className="grid gap-2 rounded-[16px] border border-[#ECEAF1] p-3"
                              >
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#B8A4E3]">
                                  <span>Матч {match.position}</span>
                                  <span>
                                    {match.status === 'finished'
                                      ? 'Завершен'
                                      : match.status === 'ready'
                                        ? 'Готов'
                                        : 'Ожидает'}
                                  </span>
                                </div>
                                {renderPlayer(match, match.player1_id)}
                                {renderPlayer(match, match.player2_id)}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-center text-center">
            <div className="grid max-w-sm justify-items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#B8A4E3] shadow-[0_12px_30px_rgba(93,60,132,0.10)]">
                <Sparkles size={30} />
              </span>
              <h3 className="text-2xl font-bold text-[#5D3C84]">Жеребьевка еще не проведена</h3>
              <p className="text-[#7A4FA0]">
                Зарегистрировано участников: {participants.length}. После жеребьевки будет построена
                сетка Double Elimination.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
