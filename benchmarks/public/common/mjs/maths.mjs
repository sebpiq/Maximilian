export const getMeanDurationSeconds = (timesInMs) =>
    timesInMs.reduce((sum, val) => sum + val, 0) / timesInMs.length / 1000