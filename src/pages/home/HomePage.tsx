import { useTournamentState } from '@/entities/tournament/model/tournamentState';
import { TournamentRegistrationForm } from '@/features/tournament-registration';
import { AdminPanel } from '@/widgets/admin/AdminPanel';
import { Hero } from '@/widgets/hero';
import { TournamentBracket } from '@/widgets/tournament-bracket/TournamentBracket';

export function HomePage() {
  const tournamentState = useTournamentState();

  return (
    <main className="min-h-screen bg-[#F8F6FB] px-5 py-8 text-[#5D3C84] sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-8">
        <Hero />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <TournamentRegistrationForm addParticipant={tournamentState.addParticipant} isDisabled={tournamentState.isLocked || !tournamentState.isSupabaseReady} isLocked={tournamentState.isLocked} />
          <TournamentBracket isLocked={tournamentState.isLocked} participants={tournamentState.participants} />
        </div>
        <AdminPanel
          addParticipant={tournamentState.addParticipant}
          deleteParticipant={tournamentState.deleteParticipant}
          error={tournamentState.error}
          isLoading={tournamentState.isLoading}
          isLocked={tournamentState.isLocked}
          isSupabaseReady={tournamentState.isSupabaseReady}
          participants={tournamentState.participants}
          renameParticipant={tournamentState.renameParticipant}
          resetTournament={tournamentState.resetTournament}
          runDraw={tournamentState.runDraw}
        />
      </div>
    </main>
  );
}
