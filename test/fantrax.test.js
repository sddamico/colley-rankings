import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchLeague } from '../fantrax.js';

const team = (id) => ({ id, name: id });
const leagueInfo = {
  leagueName: 'Test League',
  seasonYear: 2026,
  teamInfo: { a: team('a'), b: team('b') },
  scoringPeriods: [
    { number: 1, endDate: '2026-09-08T11:59:59.0-0400' },
    { number: 2, endDate: '2026-09-15T11:59:59.0-0400' },
    { number: 3, endDate: '2026-09-22T11:59:59.0-0400' },
    { number: 4, endDate: '2026-09-29T11:59:59.0-0400' },
  ],
  matchups: [1, 2, 3, 4].map((period) => ({
    period,
    matchupList: period === 2 ? [] : [{ away: team('a'), home: team('b') }],
  })),
};

function stubFantrax(t) {
  t.mock.method(globalThis, 'fetch', async (url) => {
    const { pathname, searchParams } = new URL(url);
    const body = pathname.endsWith('getLeagueInfo')
      ? leagueInfo
      : {
          period: Number(searchParams.get('period')),
          matchups: [{ away: { teamId: 'a', score: 10 }, home: { teamId: 'b', score: 5 } }],
        };
    return new Response(JSON.stringify(body));
  });
}

// 11:59:59 EDT on Sep 22 is 15:59:59 UTC, so week 3 has ended one second later.
test('counts only scheduled weeks whose scoring period has ended', async (t) => {
  stubFantrax(t);
  const league = await fetchLeague('x', { now: new Date('2026-09-22T16:00:00Z') });
  assert.deepEqual(league.weeks, [1, 3]);
  assert.deepEqual(league.games.map((g) => g.week), [1, 3]);
});

test('week 3 is still in progress one second before its end', async (t) => {
  stubFantrax(t);
  const league = await fetchLeague('x', { now: new Date('2026-09-22T15:59:58Z') });
  assert.deepEqual(league.weeks, [1]);
});

test('throughWeek caps the completed weeks', async (t) => {
  stubFantrax(t);
  const league = await fetchLeague('x', { throughWeek: 2, now: new Date('2026-12-01T00:00:00Z') });
  assert.deepEqual(league.weeks, [1]);
});

test('surfaces Fantrax error bodies', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    new Response(JSON.stringify({ error: { message: 'League not found' } })),
  );
  await assert.rejects(fetchLeague('bogus'), /League not found/);
});
