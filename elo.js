const K_FACTOR = 32;

export function expectedScore(rating, opponentRating) {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

export function updateRating(rating, opponentRating, actual) {
  return Math.round(rating + K_FACTOR * (actual - expectedScore(rating, opponentRating)));
}
