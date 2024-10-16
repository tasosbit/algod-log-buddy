# algod log buddy

## node.log metrics to csv

Converts a node.log (debug level 5) to a metrics spreadsheet

Usage: `node metrics.js filename [first-round] [last-round]`

Use optional `first-round` and `last-round` argument to filter output by target rounds.

Input file can be gzipped (requires .gz extension)

Example command:

```
node metrics.js test/node.log.sample.gz 821940 822860
```

Spreadsheet has metrics as rows, and columns as metric rounds and deltas from previous metric value

Output spreadsheet from example:

| metric                           | 821947   | 822175   | delta | 822402   | delta | 822630   | delta | 822857   | delta |
| -------------------------------- | -------- | -------- | ----- | -------- | ----- | -------- | ----- | -------- | ----- |
| algod_agreement_dropped_bundle   | 0        | 0        | 0     | 0        | 0     | 0        | 0     | 0        | 0     |
| algod_agreement_dropped_proposal | 0        | 0        | 0     | 0        | 0     | 0        | 0     | 0        | 0     |
| algod_agreement_dropped_vote     | 0        | 0        | 0     | 0        | 0     | 0        | 0     | 0        | 0     |
| algod_agreement_handled          | 57895798 | 57962094 | 66296 | 58036210 | 74116 | 58111010 | 74800 | 58186492 | 75482 |
| ...                              |          |          |       |          |       |          |       |          |       |

