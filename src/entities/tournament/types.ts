export type TournamentStatus = 'draft' | 'registration' | 'active' | 'finished' | 'cancelled';

export type Tournament = {
  id: string;
  status: TournamentStatus;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};
