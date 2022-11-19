export class Table<K, V> {
  private readonly size: number;
  private readonly map: Map<K, V>;

  constructor(size: number) {
    this.size = size;
    this.map = new Map();
  }

  public add(key: K, value: V): boolean {
    if (this.isFull()) {
      return false;
    }
    this.map.set(key, value);
    return true;
  }

  public get(key: K) {
    return this.map.get(key);
  }

  public getKeys(): K[] {
    return [...this.map.keys()];
  }

  public getSize(): number {
    return this.size;
  }

  public isFull(): boolean {
    return this.map.size >= this.size;
  }

  public remove(key: K): boolean {
    return this.map.delete(key);
  }
}
