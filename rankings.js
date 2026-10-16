import { createColleyMatrix } from './colley-matrix.js';
import { updateRating } from './elo.js';

const STARTING_ELO = 1500;

export function computeRankings(teams, games) {
  const index = new Map(teams.map((team, i) => [team.id, i]));
  const indexOf = (id) => {
    if (!index.has(id)) throw new Error(`Game references unknown team ${id}`);
    return index.get(id);
  };

  const colley = createColleyMatrix(teams.length);
  const stats = teams.map(({ name }) => ({ name, elo: STARTING_ELO, points: 0, opponents: [] }));

  for (const game of games) {
    const away = indexOf(game.away);
    const home = indexOf(game.home);
    const draw = game.awayPts === game.homePts;
    const awayWon = game.awayPts > game.homePts;

    colley.addGame(awayWon ? away : home, awayWon ? home : away, draw);

    const awayResult = draw ? 0.5 : awayWon ? 1 : 0;
    const awayElo = stats[away].elo;
    const homeElo = stats[home].elo;
    stats[away].elo = updateRating(awayElo, homeElo, awayResult);
    stats[home].elo = updateRating(homeElo, awayElo, 1 - awayResult);

    stats[away].points += game.awayPts;
    stats[home].points += game.homePts;
    stats[away].opponents.push(home);
    stats[home].opponents.push(away);
  }

  const ratings = colley.solve();

  const rows = stats
    .map((team, i) => ({ team, i }))
    .filter(({ team }) => team.opponents.length > 0)
    .map(({ team, i }) => {
      const { wins, losses, draws } = colley.records[i];
      const gamesPlayed = team.opponents.length;
      return {
        name: team.name,
        record: draws > 0 ? `${wins}-${losses}-${draws}` : `${wins}-${losses}`,
        rating: ratings[i],
        sos: team.opponents.reduce((sum, opp) => sum + ratings[opp], 0) / gamesPlayed,
        ppg: team.points / gamesPlayed,
        elo: team.elo,
      };
    });

  const bySos = [...rows].sort((a, b) => b.sos - a.sos);
  bySos.forEach((row, i) => (row.sosRank = i + 1));

  return rows.sort((a, b) => b.rating - a.rating);
}
