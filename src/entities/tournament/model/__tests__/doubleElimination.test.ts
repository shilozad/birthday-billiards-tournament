import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  applyMatchWinner,
  buildDoubleEliminationBracket,
  TournamentMatch,
} from '../doubleElimination.js';

const participants = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    name: `Player ${index + 1}`,
  }));
const notRandom = () => 0;

const playReadyMatch = (matches: TournamentMatch[]) => {
  const match = matches.find(
    (item) => item.status === 'ready' && item.player1_id && item.player2_id,
  );
  assert.ok(match, 'expected at least one ready match');
  return applyMatchWinner(matches, match.id, match.player1_id!);
};

describe('double elimination bracket', () => {
  it('builds a full structure for every participant count from 2 to 64', () => {
    for (let count = 2; count <= 64; count += 1) {
      const matches = buildDoubleEliminationBracket(participants(count), notRandom);
      assert.equal(matches.filter((match) => match.bracket === 'final').length, 1);
      assert.ok(matches.some((match) => match.bracket === 'winners'));
      assert.ok(matches.some((match) => match.bracket === 'losers'));
      assert.ok(
        matches.every(
          (match) => match.player1_id !== match.player2_id || match.player1_id === null,
        ),
      );
    }
  });

  it('auto-advances one random odd participant through a BYE', () => {
    const matches = buildDoubleEliminationBracket(participants(5), notRandom);
    const finishedUpperMatches = matches.filter(
      (match) => match.bracket === 'winners' && match.round === 1 && match.status === 'finished',
    );
    assert.ok(finishedUpperMatches.length >= 1);
    assert.ok(
      matches.some(
        (match) =>
          match.bracket === 'winners' &&
          match.round === 2 &&
          (match.player1_id || match.player2_id),
      ),
    );
  });

  it('moves upper-bracket losers into the corresponding lower-bracket match', () => {
    const initial = buildDoubleEliminationBracket(participants(4), notRandom);
    const upperReady = initial.find(
      (match) => match.bracket === 'winners' && match.round === 1 && match.status === 'ready',
    );
    assert.ok(upperReady);

    const result = applyMatchWinner(initial, upperReady.id, upperReady.player1_id!);
    const lowerMatch = result.matches.find(
      (match) =>
        match.bracket === 'losers' &&
        match.round === 1 &&
        match.position === Math.ceil(upperReady.position / 2),
    );
    assert.ok(lowerMatch);
    assert.ok(
      lowerMatch.player1_id === upperReady.player2_id ||
        lowerMatch.player2_id === upperReady.player2_id,
    );
  });

  it('finishes after a single Grand Final without reset', () => {
    let matches = buildDoubleEliminationBracket(participants(4), notRandom);
    let isFinished = false;

    for (let step = 0; step < 20 && !isFinished; step += 1) {
      const result = playReadyMatch(matches);
      matches = result.matches;
      isFinished = result.isFinished;
    }

    assert.equal(isFinished, true);
    const finalMatches = matches.filter((match) => match.bracket === 'final');
    assert.equal(finalMatches.length, 1);
    assert.equal(finalMatches[0].status, 'finished');
  });
});
