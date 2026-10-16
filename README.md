# colley-rankings

Colley Matrix and Elo rankings for the Swigmore Football League, pulled from Fantrax.

For more information about Colley: http://www.colleyrankings.com

Credit to https://github.com/Zubry/colley for the original Colley implementation

## Usage

Requires Node 22+. No dependencies to install.

```
make run                        # every completed week
make run WEEK=5                 # rankings as of the end of week 5
make run LEAGUE=<id>            # another Fantrax league
make test
```

Scores come from Fantrax's public FXEA API (`getLeagueInfo`, `getMatchupScores`), so no credentials are needed. A week counts once its Fantrax scoring period has ended; the in-progress week is skipped.

Ties count as half a win and half a loss: the game enters the Colley matrix, but the team's wins − losses term is unchanged.
