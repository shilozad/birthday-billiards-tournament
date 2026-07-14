import { useCallback, useEffect, useMemo, useState } from 'react';

import { Participant } from '@/entities/participant/types';
import { Tournament } from '@/entities/tournament/types';
import { supabase } from '@/shared/api/supabase';

const duplicateParticipantCode = '23505';

type TournamentState = {
  participants: Participant[];
  tournament: Tournament | null;
  isLoading: boolean;
  error: string;
  isLocked: boolean;
  isSupabaseReady: boolean;
  addParticipant: (name: string) => Promise<void>;
  renameParticipant: (id: string, name: string) => Promise<void>;
  deleteParticipant: (id: string) => Promise<void>;
  runDraw: () => Promise<void>;
  resetTournament: () => Promise<void>;
};

const normalizeName = (name: string) => name.trim();

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error && 'code' in error && error.code === duplicateParticipantCode) {
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
    const [{ data: participantsData, error: participantsError }, { data: tournamentData, error: tournamentError }] = await Promise.all([
      client.from('participants').select('id,name,created_at').order('created_at', { ascending: true }),
      client.from('tournament').select('id,status,created_at,started_at,finished_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (participantsError || tournamentError) {
      setError(getErrorMessage(participantsError ?? tournamentError));
    } else {
      setParticipants(participantsData ?? []);
      setTournament(tournamentData);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => void loadState())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament' }, () => void loadState())
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

      const { error: insertError } = await client.from('participants').insert({ name: trimmedName });
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

      const { error: updateError } = await client.from('participants').update({ name: trimmedName }).eq('id', id);
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

    const { error: updateError } = await client
      .from('tournament')
      .update({ status: 'active', started_at: new Date().toISOString(), finished_at: null })
      .eq('id', tournament?.id ?? '');

    if (updateError) throw new Error(getErrorMessage(updateError));
  }, [participants.length, tournament?.id]);

  const resetTournament = useCallback(async () => {
    if (!supabase) throw new Error('Supabase не настроен.');
    const client = supabase;

    const { error: resetError } = await client.rpc('reset_tournament');
    if (resetError) throw new Error(getErrorMessage(resetError));
  }, []);

  return useMemo(
    () => ({ participants, tournament, isLoading, error, isLocked, isSupabaseReady, addParticipant, renameParticipant, deleteParticipant, runDraw, resetTournament }),
    [participants, tournament, isLoading, error, isLocked, isSupabaseReady, addParticipant, renameParticipant, deleteParticipant, runDraw, resetTournament],
  );
}
