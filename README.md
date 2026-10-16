# colley-rankings

Colley Matrix and Elo rankings for the CFB league.

For more information about Colley: http://www.colleyrankings.com

Credit to https://github.com/Zubry/colley for the original Colley implementation

## Usage

Requires Node 22+.

```
npm install
npm start                      # reads results.csv
node index.js path/to/games.csv
npm test
```

`results.json` holds the league's team names. Game results are a CSV (not tracked) with this header; `#` lines are comments:

```
AWAY,AWAY_PTS,HOME,HOME_PTS
# Week 1,,,
Team A,116.86,Team B,108.1
```
