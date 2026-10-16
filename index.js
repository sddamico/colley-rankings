import { parseArgs } from 'node:util';
import { fetchLeague } from './fantrax.js';
import { computeRankings } from './rankings.js';

const SWIGMORE_LEAGUE_ID = '4c8h6rl9mlpekt83';

const { values } = parseArgs({
  options: {
    league: { type: 'string', default: SWIGMORE_LEAGUE_ID },
    week: { type: 'string' },
  },
});

const throughWeek = values.week === undefined ? undefined : Number.parseInt(values.week, 10);
const league = await fetchLeague(values.league, { throughWeek });
if (league.weeks.length === 0) {
  console.error(`${league.name} ${league.season} has no completed weeks yet`);
  process.exit(1);
}

const rankings = computeRankings(league.teams, league.games);

console.log(`${league.name} ${league.season}, through week ${Math.max(...league.weeks)}\n`);

rankings.forEach((r, i) => {
  console.log(
    `${i + 1}. ${r.name}, ${r.record}, Rating: ${r.rating.toFixed(4)}, SoS: ${r.sosRank}, PPG: ${r.ppg.toFixed(2)}, ELO: ${r.elo.toFixed(0)}`,
  );
});

console.log('\n--- ELO Rankings ---\n');

[...rankings]
  .sort((a, b) => b.elo - a.elo)
  .forEach((r, i) => {
    console.log(`${i + 1}. ${r.name}, ${r.record}, PPG: ${r.ppg.toFixed(2)}, ELO: ${r.elo.toFixed(0)}`);
  });
