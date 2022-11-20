export class Table<K, V> {
  private readonly size: number;
  private readonly map: Map<K, V>;

  constructor(size: number) {
    this.size = size;
    this.map = new Map();
  }

  /**
   * Add value with key in table
   *
   * @param key
   * @param value
   */
  public add(key: K, value: V): void {
    if (this.isFull()) {
      throw new Error("Table is full!");
    }
    this.map.set(key, value);
  }

  /**
   * Get with key
   *
   * @param key
   * @returns
   */
  public get(key: K): V | undefined {
    return this.map.get(key);
  }

  /**
   * Get table keys
   *
   * @returns
   */
  public getKeys(): K[] {
    return [...this.map.keys()];
  }

  /**
   * Get table current size (number of entries)
   *
   * @returns
   */
  public getSize(): number {
    return this.map.size;
  }

  /**
   * Get table max size
   *
   * @returns
   */
  public getMaxSize(): number {
    return this.size;
  }

  /**
   * Check if the table full
   *
   * @returns
   */
  public isFull(): boolean {
    return this.map.size >= this.size;
  }

  /**
   * Remove entry from table using key
   *
   * @param key
   * @returns
   */
  public remove(key: K): boolean {
    return this.map.delete(key);
  }
}
