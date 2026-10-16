import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createColleyMatrix } from '../colley-matrix.js';
import { computeRankings } from '../rankings.js';

const teams = (...ids) => ids.map((id) => ({ id, name: `Team ${id}` }));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('single game: winner 5/8, loser 3/8', () => {
  const colley = createColleyMatrix(2);
  colley.addGame(0, 1);
  const [a, b] = colley.solve();
  close(a, 0.625);
  close(b, 0.375);
});

test('draw leaves both teams at 1/2', () => {
  const colley = createColleyMatrix(2);
  colley.addGame(0, 1, true);
  const [a, b] = colley.solve();
  close(a, 0.5);
  close(b, 0.5);
});

test('A beats B, B beats C: 2/3, 1/2, 1/3', () => {
  const colley = createColleyMatrix(3);
  colley.addGame(0, 1);
  colley.addGame(1, 2);
  const [a, b, c] = colley.solve();
  close(a, 2 / 3);
  close(b, 0.5);
  close(c, 1 / 3);
});

test('computeRankings orders by rating and derives record, ppg, elo, sos', () => {
  const rankings = computeRankings(
    teams('A', 'B', 'C'),
    [
      { away: 'A', awayPts: 100, home: 'B', homePts: 90 },
      { away: 'C', awayPts: 80, home: 'B', homePts: 110 },
    ],
  );
  assert.deepEqual(rankings.map((r) => r.name), ['Team A', 'Team B', 'Team C']);
  assert.deepEqual(rankings.map((r) => r.record), ['1-0', '1-1', '0-1']);
  close(rankings[1].ppg, 100);
  assert.equal(rankings[0].elo, 1516);
  close(rankings[1].sos, (2 / 3 + 1 / 3) / 2);
  assert.equal(rankings[1].sosRank, 3);
});

test('teams without games are omitted', () => {
  const rankings = computeRankings(teams('A', 'B', 'Idle'), [{ away: 'A', awayPts: 1, home: 'B', homePts: 0 }]);
  assert.deepEqual(rankings.map((r) => r.name), ['Team A', 'Team B']);
});

test('unknown team name throws', () => {
  assert.throws(
    () => computeRankings(teams('A'), [{ away: 'A', awayPts: 1, home: 'Typo', homePts: 0 }]),
    /unknown team Typo/,
  );
});
