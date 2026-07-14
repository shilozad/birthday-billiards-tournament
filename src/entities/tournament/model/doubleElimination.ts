import type { Participant } from '../../participant/types.js';

export type BracketKind = 'winners' | 'losers' | 'final';
export type MatchStatus = 'pending' | 'ready' | 'finished';
export type Slot = 'player1_id' | 'player2_id';

export type TournamentMatch = {
  id: string;
  round: number;
  bracket: BracketKind;
  position: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  loser_id: string | null;
  status: MatchStatus;
};

export type MatchPatch = {
  bracket: BracketKind;
  round: number;
  position: number;
  player1_id?: string | null;
  player2_id?: string | null;
  winner_id?: string | null;
  loser_id?: string | null;
  status?: MatchStatus;
};

export type ParticipantSeed = Pick<Participant, 'id' | 'name'>;

const minPlayers = 2;
const maxPlayers = 64;

export const nextPowerOfTwo = (value: number): number => {
  if (value < 1) return 1;
  return 2 ** Math.ceil(Math.log2(value));
};

const createMatchId = (bracket: BracketKind, round: number, position: number) =>
  `${bracket}-${round}-${position}`;

const createMatch = (bracket: BracketKind, round: number, position: number): TournamentMatch => ({
  id: createMatchId(bracket, round, position),
  bracket,
  round,
  position,
  player1_id: null,
  player2_id: null,
  winner_id: null,
  loser_id: null,
  status: 'pending',
});

export const shuffleParticipants = <T>(
  participants: readonly T[],
  random: () => number = Math.random,
): T[] => {
  const result = [...participants];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const findMatch = (
  matches: TournamentMatch[],
  bracket: BracketKind,
  round: number,
  position: number,
) =>
  matches.find(
    (match) => match.bracket === bracket && match.round === round && match.position === position,
  );

const putPlayer = (match: TournamentMatch, slot: Slot, playerId: string | null) => {
  match[slot] = playerId;
  match.status = match.player1_id && match.player2_id ? 'ready' : 'pending';
};

const advanceWinnerTarget = (
  powerSize: number,
  match: TournamentMatch,
): { bracket: BracketKind; round: number; position: number; slot: Slot } | null => {
  const upperRounds = Math.log2(powerSize);
  if (match.bracket === 'winners') {
    if (match.round === upperRounds)
      return { bracket: 'final', round: 1, position: 1, slot: 'player1_id' };
    return {
      bracket: 'winners',
      round: match.round + 1,
      position: Math.ceil(match.position / 2),
      slot: match.position % 2 === 1 ? 'player1_id' : 'player2_id',
    };
  }

  if (match.bracket === 'losers') {
    const lowerRounds = Math.max(1, 2 * (upperRounds - 1));
    if (match.round === lowerRounds)
      return { bracket: 'final', round: 1, position: 1, slot: 'player2_id' };
    const isOddRound = match.round % 2 === 1;
    return {
      bracket: 'losers',
      round: match.round + 1,
      position: isOddRound ? match.position : Math.ceil(match.position / 2),
      slot: isOddRound || match.position % 2 === 1 ? 'player1_id' : 'player2_id',
    };
  }

  return null;
};

const upperLoserTarget = (
  match: TournamentMatch,
): { bracket: BracketKind; round: number; position: number; slot: Slot } | null => {
  if (match.bracket !== 'winners') return null;
  if (match.round === 1)
    return {
      bracket: 'losers',
      round: 1,
      position: Math.ceil(match.position / 2),
      slot: match.position % 2 === 1 ? 'player1_id' : 'player2_id',
    };
  return {
    bracket: 'losers',
    round: 2 * match.round - 2,
    position: match.position,
    slot: 'player2_id',
  };
};

export const buildDoubleEliminationBracket = (
  participants: readonly ParticipantSeed[],
  random: () => number = Math.random,
): TournamentMatch[] => {
  if (participants.length < minPlayers || participants.length > maxPlayers) {
    throw new Error('Double Elimination поддерживает от 2 до 64 участников.');
  }

  const seeded = shuffleParticipants(participants, random);
  const powerSize = nextPowerOfTwo(seeded.length);
  const upperRounds = Math.log2(powerSize);
  const matches: TournamentMatch[] = [];

  for (let round = 1; round <= upperRounds; round += 1) {
    for (let position = 1; position <= powerSize / 2 ** round; position += 1) {
      matches.push(createMatch('winners', round, position));
    }
  }

  const lowerRounds = Math.max(1, 2 * (upperRounds - 1));
  for (let round = 1; round <= lowerRounds; round += 1) {
    const positionCount = Math.max(1, powerSize / 2 ** (Math.floor((round + 1) / 2) + 1));
    for (let position = 1; position <= positionCount; position += 1) {
      matches.push(createMatch('losers', round, position));
    }
  }

  matches.push(createMatch('final', 1, 1));

  const firstRound = matches.filter((match) => match.bracket === 'winners' && match.round === 1);
  const slots: Array<string | null> = [
    ...seeded.map((participant) => participant.id),
    ...Array<string | null>(powerSize - seeded.length).fill(null),
  ];
  firstRound.forEach((match, index) => {
    match.player1_id = slots[index * 2] ?? null;
    match.player2_id = slots[index * 2 + 1] ?? null;
    match.status = match.player1_id && match.player2_id ? 'ready' : 'pending';
  });

  return resolveAutomaticAdvancements(matches, powerSize).matches;
};

export const resolveAutomaticAdvancements = (
  sourceMatches: readonly TournamentMatch[],
  powerSize = nextPowerOfTwo(
    sourceMatches.filter((match) => match.bracket === 'winners' && match.round === 1).length * 2,
  ),
): { matches: TournamentMatch[]; patches: MatchPatch[] } => {
  const matches = sourceMatches.map((match) => ({ ...match }));
  const patches: MatchPatch[] = [];
  let changed = true;

  while (changed) {
    changed = false;
    for (const match of matches) {
      if (match.winner_id || match.status === 'finished') continue;
      const players = [match.player1_id, match.player2_id].filter(Boolean) as string[];
      if (players.length !== 1) continue;
      const winnerId = players[0];
      match.winner_id = winnerId;
      match.loser_id = null;
      match.status = 'finished';
      patches.push({
        bracket: match.bracket,
        round: match.round,
        position: match.position,
        winner_id: winnerId,
        loser_id: null,
        status: 'finished',
      });
      const target = advanceWinnerTarget(powerSize, match);
      if (target) {
        const nextMatch = findMatch(matches, target.bracket, target.round, target.position);
        if (nextMatch && !nextMatch[target.slot]) {
          putPlayer(nextMatch, target.slot, winnerId);
          patches.push({
            bracket: nextMatch.bracket,
            round: nextMatch.round,
            position: nextMatch.position,
            [target.slot]: winnerId,
            status: nextMatch.status,
          });
        }
      }
      changed = true;
    }
  }

  return { matches, patches };
};

export const applyMatchWinner = (
  sourceMatches: readonly TournamentMatch[],
  matchId: string,
  winnerId: string,
): { matches: TournamentMatch[]; patches: MatchPatch[]; isFinished: boolean } => {
  const matches = sourceMatches.map((match) => ({ ...match }));
  const match = matches.find((item) => item.id === matchId);
  if (!match) throw new Error('Матч не найден.');
  if (match.status === 'finished') throw new Error('Победитель этого матча уже выбран.');
  if (match.player1_id !== winnerId && match.player2_id !== winnerId)
    throw new Error('Победитель должен быть участником матча.');
  if (!match.player1_id || !match.player2_id)
    throw new Error('Нельзя выбрать победителя до формирования пары.');

  const powerSize = nextPowerOfTwo(
    matches.filter((item) => item.bracket === 'winners' && item.round === 1).length * 2,
  );
  const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id;
  match.winner_id = winnerId;
  match.loser_id = loserId;
  match.status = 'finished';

  const patches: MatchPatch[] = [
    {
      bracket: match.bracket,
      round: match.round,
      position: match.position,
      winner_id: winnerId,
      loser_id: loserId,
      status: 'finished',
    },
  ];

  const winnerTarget = advanceWinnerTarget(powerSize, match);
  if (winnerTarget) {
    const targetMatch = findMatch(
      matches,
      winnerTarget.bracket,
      winnerTarget.round,
      winnerTarget.position,
    );
    if (targetMatch) {
      putPlayer(targetMatch, winnerTarget.slot, winnerId);
      patches.push({
        bracket: targetMatch.bracket,
        round: targetMatch.round,
        position: targetMatch.position,
        [winnerTarget.slot]: winnerId,
        status: targetMatch.status,
      });
    }
  }

  const loserTarget = upperLoserTarget(match);
  if (loserTarget && loserId) {
    const targetMatch = findMatch(
      matches,
      loserTarget.bracket,
      loserTarget.round,
      loserTarget.position,
    );
    if (targetMatch) {
      putPlayer(targetMatch, loserTarget.slot, loserId);
      patches.push({
        bracket: targetMatch.bracket,
        round: targetMatch.round,
        position: targetMatch.position,
        [loserTarget.slot]: loserId,
        status: targetMatch.status,
      });
    }
  }

  const resolved = resolveAutomaticAdvancements(matches, powerSize);
  return {
    matches: resolved.matches,
    patches: [...patches, ...resolved.patches],
    isFinished: match.bracket === 'final',
  };
};
