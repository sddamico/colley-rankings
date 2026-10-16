// Adapted from https://github.com/Zubry/colley/blob/master/colley-matrix.js

// Colley system Cr = b:
//   C[i][i] = 2 + games played by i
//   C[i][j] = -(games between i and j)
//   b[i]    = 1 + (wins - losses) / 2
// A draw counts as half a win and half a loss, so it adds to C but not to b.
export function createColleyMatrix(teamCount) {
  const C = Array.from({ length: teamCount }, (_, i) =>
    Array.from({ length: teamCount }, (_, j) => (i === j ? 2 : 0)),
  );
  const records = Array.from({ length: teamCount }, () => ({ wins: 0, losses: 0, draws: 0 }));

  function addGame(winner, loser, draw = false) {
    C[winner][loser] -= 1;
    C[loser][winner] -= 1;
    C[winner][winner] += 1;
    C[loser][loser] += 1;

    if (draw) {
      records[winner].draws++;
      records[loser].draws++;
    } else {
      records[winner].wins++;
      records[loser].losses++;
    }
  }

  function solve() {
    const b = records.map(({ wins, losses }) => 1 + (wins - losses) / 2);
    return solveLinear(C, b);
  }

  return { records, addGame, solve };
}

// C is symmetric positive definite, so elimination without pivoting is stable.
function solveLinear(matrix, vector) {
  const n = vector.length;
  const A = matrix.map((row) => [...row]);
  const x = [...vector];

  for (let k = 0; k < n; k++) {
    for (let i = k + 1; i < n; i++) {
      const factor = A[i][k] / A[k][k];
      for (let j = k; j < n; j++) A[i][j] -= factor * A[k][j];
      x[i] -= factor * x[k];
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) x[i] -= A[i][j] * x[j];
    x[i] /= A[i][i];
  }
  return x;
}
