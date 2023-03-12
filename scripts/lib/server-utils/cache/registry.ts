export class CacheRegistry {
  readonly data: Buffer;
  readonly creationTime: number;
  
  constructor(dada: Buffer) {
    this.data = dada;
    this.creationTime = Date.now();
  }

  isUpdated(lastModificationTime: number) {
    return this.creationTime >= lastModificationTime;
  }
}