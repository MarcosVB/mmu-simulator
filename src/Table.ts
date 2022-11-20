export class Table<K, V> {
  private readonly size: number;
  private readonly map: Map<K, V>;

  constructor(size: number) {
    this.size = size;
    this.map = new Map();
  }

  public add(key: K, value: V): void {
    if (this.isFull()) {
      throw new Error("Table is full!");
    }
    this.map.set(key, value);
  }

  public get(key: K): V | undefined {
    return this.map.get(key);
  }

  public getKeys(): K[] {
    return [...this.map.keys()];
  }

  public getSize(): number {
    return this.map.size;
  }

  public getMaxSize(): number {
    return this.size;
  }

  public isFull(): boolean {
    return this.map.size >= this.size;
  }

  public remove(key: K): boolean {
    return this.map.delete(key);
  }
}
