import { TournamentRegistrationForm } from '@/features/tournament-registration';
import { Hero } from '@/widgets/hero';

export function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_35%),linear-gradient(135deg,_#020617,_#064e3b)] px-6 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <Hero />
        <TournamentRegistrationForm />
      </div>
    </main>
  );
}
