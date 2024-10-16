import { createReadStream, } from 'fs';
import { createGunzip } from 'zlib';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises'
import LineSplitStream from './line-split-stream.js';

const filename = process.argv[2];
const firstRound = Number(process.argv[3] ?? 0);
const lastRound = Number(process.argv[4] ?? Infinity);

let lineCounter=0;
const LOG_EVERY = 50_000;

const metricsData = {};

// actual processor. stream that accepts a log line (JSON as string)
export default class ProcessLineStream extends Transform {
  constructor() {
    super({ objectMode: true });
  }
  async _transform(line, encoding, callback) {
    // uncomment to log progress
    lineCounter++;
    if (lineCounter % LOG_EVERY === 0) {
      console.warn(`Ingested ${lineCounter}`);
    }
    if (!line.trim())
      return callback();
    try {
      if (!(line.includes("Metrics"))) {
        return callback();
      }
      const data = JSON.parse(line);
      let { details, time } = data;
      if (!details?.Metrics) {
        return callback();
      }
      const { m } = details;
      const { algod_ledger_round: round } = m;
      if (firstRound <= round && round <= lastRound) {
        metricsData[round] = m;
      }
    } catch(e) {
      console.error(`Error ${e.message} line ${line}`);
    }
    callback();
  }
}

try {
  const processStream = new ProcessLineStream();
  const lineStream = new LineSplitStream(processStream);
  const fileStream = createReadStream(filename);
  const pipes = [fileStream, filename.endsWith('gz') ? createGunzip() : null, lineStream, processStream].filter(Boolean);
  // run stream, populates intermediate per-step voters{} 
  await pipeline(pipes);
} catch(e) {
  console.error(e);
  process.exit(1);
}

const header = ['metric', ...Object.keys(metricsData).map((f, i) => i>0 ? `${f},delta` : f)].join(',');
const rows = [];
if (!Object.keys(metricsData).length) {
  console.warn("No metrics found");
  process.exit(1);
}
const firstMetricsData = metricsData[Object.keys(metricsData)[0]];
const fields = Object.keys(firstMetricsData);
for(const field of fields) {
  const row = [field];
  let prev;
  for(const [rnd, m] of Object.entries(metricsData)) {
    let delta;
    if (prev !== undefined)
      delta = m[field] - prev;
    row.push(m[field]);
    if (delta !== undefined)
      row.push(delta);
    prev = m[field];
  }
  rows.push(row.join(','));
}
console.log(header);
console.log(rows.join('\n'));
