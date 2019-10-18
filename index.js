let Colley = require('colley-rankings');
var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('results.json', 'utf8'));

let league = Colley(obj.teams.length);

obj.results.forEach(function(week) {
  week.contests.forEach(function(contest) {
    league.addGame(obj.teams.indexOf(contest.winner), obj.teams.indexOf(contest.loser));
  });
});

var results = league.solve();

var mappedResults = [];
results.array.forEach(function(score, index) {
  mappedResults.push({
    "name": obj.teams[index],
    "score": score
  })
});

mappedResults.sort(function(l,r) {
  return r.score - l.score;
});

mappedResults.forEach(function(result, index) {
  console.log((index + 1) + ". " + result.name + ", " + result.score);
});
