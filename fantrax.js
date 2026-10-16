const BASE_URL = 'https://www.fantrax.com/fxea/general';
const MAX_ATTEMPTS = 4;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

async function getJson(method, params) {
  const url = `${BASE_URL}/${method}?${new URLSearchParams(params)}`;
  let lastError;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        lastError = new Error(`Fantrax ${method} returned HTTP ${response.status}`);
        if (RETRYABLE_STATUS.has(response.status)) continue;
        throw lastError;
      }
      // Fantrax reports bad requests as HTTP 200 with an error body.
      const body = await response.json();
      if (body.error) throw new Error(`Fantrax ${method}: ${body.error.message}`);
      return body;
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      lastError = error;
    }
  }
  throw new Error(`Fantrax ${method} failed after ${MAX_ATTEMPTS} attempts`, { cause: lastError });
}

// Fantrax offsets look like "-0400", which Date only parses as "-04:00".
function parseFantraxDate(value) {
  return new Date(value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
}

// Only scoring periods that have ended count; an in-progress week has partial scores.
export async function fetchLeague(leagueId, { throughWeek, now = new Date() } = {}) {
  const info = await getJson('getLeagueInfo', { leagueId });

  const teams = Object.values(info.teamInfo).map(({ id, name }) => ({ id, name: name.trim() }));
  const scheduledWeeks = new Set(info.matchups.filter((p) => p.matchupList.length > 0).map((p) => p.period));
  const completedWeeks = info.scoringPeriods
    .filter((p) => scheduledWeeks.has(p.number) && parseFantraxDate(p.endDate) < now)
    .map((p) => p.number)
    .filter((week) => throughWeek === undefined || week <= throughWeek);

  const weeks = await Promise.all(
    completedWeeks.map((period) => getJson('getMatchupScores', { leagueId, period })),
  );
  const games = weeks.flatMap(({ period, matchups }) =>
    matchups.map(({ away, home }) => ({
      week: period,
      away: away.teamId,
      awayPts: away.score,
      home: home.teamId,
      homePts: home.score,
    })),
  );

  return { name: info.leagueName, season: info.seasonYear, weeks: completedWeeks, teams, games };
}
