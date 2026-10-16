import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { parse } from 'csv-parse/sync';
import { computeRankings } from './rankings.js';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { teams: { type: 'string', default: 'results.json' } },
});
const resultsPath = positionals[0] ?? 'results.csv';

const { teams } = JSON.parse(readFileSync(values.teams, 'utf8'));
const games = parse(readFileSync(resultsPath, 'utf8'), {
  comment: '#',
  columns: true,
  skip_empty_lines: true,
}).map((row) => ({
  away: row.AWAY,
  awayPts: Number.parseFloat(row.AWAY_PTS),
  home: row.HOME,
  homePts: Number.parseFloat(row.HOME_PTS),
}));

const rankings = computeRankings(teams, games);

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
