import { Transform } from 'stream';
import { once } from 'events';

export default class LineSplitStream extends Transform {
  constructor(downStream, offset = 0) {
    super({ objectMode: true });
    this.downStream = downStream;
    this.buffered = '';
    this.lineCount = 0;
    this.offset = offset;
  }
  async _transform(chunk, encoding, callback) {
    if (typeof chunk !== "string") {
      chunk = chunk.toString();
    }
    let backpress = 0;
    if (chunk.includes('\n')) {
      const parts = chunk.split('\n');
      // we have buffered history; prepend to first part
      if (this.buffered.length) {
        parts[0] = this.buffered + parts[0];
        this.buffered = '';
      }
      // if we have remainder after \n, push it to this.buffered
      if (parts[parts.length - 1] !== '') {
        this.buffered = parts.pop();
      } else {
        parts.pop();
      }
      for (const part of parts) {
        if (this.offset && this.lineCount++ < this.offset) {
          continue;
        }
        if (!this.push(part)) {
          if (this.downStream)
            await once(this.downStream, 'drain');
          backpress += 1;
        }
      }
    } else {
      // no newline here, buffering
      this.buffered += chunk;
    }
    callback();
  }
  // end(...args) {
  //   console.error(...args);
  //   console.error('linestream ended');
  //   if (this.buffered.length) {
  //     this.push(this.buffered);
  //   }
  //   this.emit('end');
  // }
}
