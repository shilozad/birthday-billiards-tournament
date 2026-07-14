import { useCallback, useEffect, useMemo, useState } from 'react';

import { Participant } from '@/entities/participant/types';
import { Tournament } from '@/entities/tournament/types';
import {
  applyMatchWinner,
  buildDoubleEliminationBracket,
  TournamentMatch,
} from '@/entities/tournament/model/doubleElimination';
import { supabase } from '@/shared/api/supabase';

const duplicateParticipantCode = '23505';

type TournamentState = {
  participants: Participant[];
  tournament: Tournament | null;
  matches: TournamentMatch[];
  isLoading: boolean;
  error: string;
  isLocked: boolean;
  isSupabaseReady: boolean;
  addParticipant: (name: string) => Promise<void>;
  renameParticipant: (id: string, name: string) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  runDraw: () => Promise<void>;
  resetTournament: () => Promise<void>;
  selectMatchWinner: (matchId: string, winnerId: string) => Promise<void>;
};

const normalizeName = (name: string) => name.trim();

const toTournamentMatch = (match: {
  id: string;
  round: number;
  bracket: 'winners' | 'losers' | 'final';
  position: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  loser_id: string | null;
  status: 'pending' | 'ready' | 'in_progress' | 'finished' | 'cancelled';
}): TournamentMatch => ({
  id: match.id,
  round: match.round,
  bracket: match.bracket,
  position: match.position,
  player1_id: match.player1_id,
  player2_id: match.player2_id,
  winner_id: match.winner_id,
  loser_id: match.loser_id,
  status: match.status === 'finished' ? 'finished' : match.status === 'ready' ? 'ready' : 'pending',
});

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error &&
    'code' in error &&
    error.code === duplicateParticipantCode
  ) {
    return 'Участник с таким именем уже зарегистрирован.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось выполнить действие. Попробуйте еще раз.';
};

export function useTournamentState(): TournamentState {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  const isLocked = tournament?.status === 'active' || tournament?.status === 'finished';
  const isSupabaseReady = Boolean(supabase);

  const loadState = useCallback(async () => {
    if (!supabase) {
      setError('Supabase не настроен: заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.');
      return;
    }

    const client = supabase;
    setIsLoading(true);
    const [
      { data: participantsData, error: participantsError },
      { data: tournamentData, error: tournamentError },
      { data: matchesData, error: matchesError },
    ] = await Promise.all([
      client
        .from('participants')
        .select('id,name,created_at')
        .order('created_at', { ascending: true }),
      client
        .from('tournament')
        .select('id,status,created_at,started_at,finished_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from('matches')
        .select('id,round,bracket,position,player1_id,player2_id,winner_id,loser_id,status')
        .order('bracket', { ascending: true })
        .order('round', { ascending: true })
        .order('position', { ascending: true }),
    ]);

    if (participantsError || tournamentError || matchesError) {
      setError(getErrorMessage(participantsError ?? tournamentError ?? matchesError));
    } else {
      setParticipants(participantsData ?? []);
      setTournament(tournamentData);
      setMatches((matchesData ?? []).map(toTournamentMatch));
      setError('');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    if (!supabase) return undefined;

    const client = supabase;
    const channel = client
      .channel('tournament-state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => void loadState(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament' },
        () => void loadState(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => void loadState(),
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadState]);

  const ensureUnlocked = useCallback(() => {
    if (isLocked) {
      throw new Error('Жеребьевка уже проведена. Редактирование участников заблокировано.');
    }
  }, [isLocked]);

  const addParticipant = useCallback(
    async (name: string) => {
      if (!supabase) throw new Error('Supabase не настроен.');
      const client = supabase;
      ensureUnlocked();
      const trimmedName = normalizeName(name);
      if (!trimmedName) throw new Error('Введите имя участника.');

      const { error: insertError } = await client
        .from('participants')
        .insert({ name: trimmedName });
      if (insertError) throw new Error(getErrorMessage(insertError));
    },
    [ensureUnlocked],
  );

  const renameParticipant = useCallback(
    async (id: string, name: string) => {
      if (!supabase) throw new Error('Supabase не настроен.');
      const client = supabase;
      ensureUnlocked();
      const trimmedName = normalizeName(name);
      if (!trimmedName) throw new Error('Введите новое имя участника.');

      const { error: updateError } = await client
        .from('participants')
        .update({ name: trimmedName })
        .eq('id', id);
      if (updateError) throw new Error(getErrorMessage(updateError));
    },
    [ensureUnlocked],
  );

  const deleteParticipant = useCallback(
    async (id: string) => {
      if (!supabase) throw new Error('Supabase не настроен.');
      const client = supabase;
      ensureUnlocked();
      const { error: deleteError } = await client.from('participants').delete().eq('id', id);
      if (deleteError) throw new Error(getErrorMessage(deleteError));
    },
    [ensureUnlocked],
  );

  const runDraw = useCallback(async () => {
    if (!supabase) throw new Error('Supabase не настроен.');
    const client = supabase;
    if (participants.length < 2) throw new Error('Для жеребьевки нужно минимум два участника.');

    const bracket = buildDoubleEliminationBracket(participants);
    const { error: deleteError } = await client
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) throw new Error(getErrorMessage(deleteError));

    const { error: insertError } = await client.from('matches').insert(
      bracket.map((match) => ({
        bracket: match.bracket,
        round: match.round,
        position: match.position,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        winner_id: match.winner_id,
        loser_id: match.loser_id,
        status: match.status,
      })),
    );
    if (insertError) throw new Error(getErrorMessage(insertError));

    const { error: updateError } = await client
      .from('tournament')
      .update({ status: 'active', started_at: new Date().toISOString(), finished_at: null })
      .eq('id', tournament?.id ?? '');

    if (updateError) throw new Error(getErrorMessage(updateError));
  }, [participants, tournament?.id]);

  const selectMatchWinner = useCallback(
    async (matchId: string, winnerId: string) => {
      if (!supabase) throw new Error('Supabase не настроен.');
      const client = supabase;
      const result = applyMatchWinner(matches, matchId, winnerId);

      for (const patch of result.patches) {
        const { bracket, round, position, ...values } = patch;
        const { error: updateError } = await client
          .from('matches')
          .update(values)
          .eq('bracket', bracket)
          .eq('round', round)
          .eq('position', position);
        if (updateError) throw new Error(getErrorMessage(updateError));
      }

      if (result.isFinished) {
        const { error: finishError } = await client
          .from('tournament')
          .update({ status: 'finished', finished_at: new Date().toISOString() })
          .eq('id', tournament?.id ?? '');
        if (finishError) throw new Error(getErrorMessage(finishError));
      }
    },
    [matches, tournament?.id],
  );

  const resetTournament = useCallback(async () => {
    if (!supabase) throw new Error('Supabase не настроен.');
    const client = supabase;

    const { error: resetError } = await client.rpc('reset_tournament');
    if (resetError) throw new Error(getErrorMessage(resetError));
  }, []);

  return useMemo(
    () => ({
      participants,
      tournament,
      matches,
      isLoading,
      error,
      isLocked,
      isSupabaseReady,
      addParticipant,
      renameParticipant,
      deleteParticipant,
      runDraw,
      resetTournament,
      selectMatchWinner,
    }),
    [
      participants,
      tournament,
      matches,
      isLoading,
      error,
      isLocked,
      isSupabaseReady,
      addParticipant,
      renameParticipant,
      deleteParticipant,
      runDraw,
      resetTournament,
      selectMatchWinner,
    ],
  );
}
