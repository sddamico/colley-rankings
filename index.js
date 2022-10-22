let Colley = require('./colley-matrix');
var fs = require('fs');

var obj = JSON.parse(fs.readFileSync('results.json', 'utf8'));
var teams = obj.teams;

let league = Colley(teams.length);

obj.results.forEach(function(week) {
  week.contests.forEach(function(contest) {
    var winnerIdx = teams.indexOf(contest.winner);
    var loserIdx = teams.indexOf(contest.loser);
    league.addGame(winnerIdx, loserIdx);
  });
});

var results = league.solve();
var matrix = league.matrix;

var mappedResults = [];
results.array.forEach(function(score, index) {
  var teamName = teams[index];
  var team = matrix[index];
  mappedResults.push({
    "name": teamName,
    "score": score,
    "record": team.wins + "-" + team.losses
  })
});

mappedResults.sort(function(l,r) {
  return r.score - l.score;
});

mappedResults.forEach(function(result, index) {
  console.log((index + 1) + ". " + result.name + ", " + result.record + ", " + result.score);
});
