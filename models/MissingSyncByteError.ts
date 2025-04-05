export class MissingSyncByteError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "MissingSyncByteError";
  }
}
