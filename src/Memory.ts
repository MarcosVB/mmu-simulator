import { Block } from "./Block";
import { Table } from "./Table";

export class Memory {
  private readonly table: Table<number, Table<number, Block>>;

  constructor(size: number, blockSize: number) {
    this.table = new Table(size / blockSize);
  }

  /**
   * Add block into memory
   *
   * @param block
   */
  public add(block: Block): void {
    if (this.isFull()) {
      throw new Error("Memory is full!");
    }

    this.addBlock(block);
  }

  /**
   * Add blocks in batch into memory
   *
   * @param blocks
   */
  public addBatch(blocks: Block[]) {
    if (!this.hasCapacity(blocks.length)) {
      throw new Error("Memory overflow!");
    }

    blocks.forEach((block) => this.addBlock(block));
  }

  /**
   * Add block into memory without capacity check
   *
   * @param block
   */
  private addBlock(block: Block): void {
    const blockTable =
      this.table.get(block.getPid()) ?? new Table(this.table.getMaxSize());
    blockTable.add(block.getId(), block);

    this.table.add(block.getPid(), blockTable);
  }

  /**
   * Creates table key for informed pid and index
   *
   * @param pid
   * @param index
   * @returns
   */
  private createBlockKey(pid: number, index: number): string {
    return `${pid}:${index}`;
  }

  /**
   * Get block with key
   *
   * @param pid
   * @param index
   * @returns
   */
  public get(pid: number, index: number) {
    return this.table.get(pid)?.get(index);
  }

  /**
   * Get block keys
   *
   * @returns
   */
  public getKeys() {
    return this.table.getKeys();
  }

  /**
   * Get current memory load
   *
   * @returns
   */
  public getLoad() {
    return this.getSize() / this.table.getMaxSize();
  }

  /**
   * Get block table from process with pid
   *
   * @param pid
   * @returns
   */
  public getBlockTable(pid: number) {
    return this.table.get(pid);
  }

  /**
   * Get current memory size (blocks)
   *
   * @returns
   */
  public getSize() {
    const pids = this.table.getKeys();

    let size = 0;

    pids.forEach((pid) => {
      size += this.table.get(pid).getSize();
    });

    return size;
  }

  /**
   * Check if memory can load n amount of blocks
   *
   * @param amount
   * @returns
   */
  public hasCapacity(amount: number) {
    return this.table.getMaxSize() >= this.getSize() + amount;
  }

  /**
   * Check if memory is full
   *
   * @returns
   */
  public isFull() {
    // TODO: improve this
    return this.table.getMaxSize() <= this.getSize();
  }

  /**
   * Remove block from memory using pid and index
   *
   * @param pid
   * @param index
   */
  public remove(pid: number, index: number) {
    this.table.get(pid)?.remove(index);
    if (this.table.get(pid)?.getSize() === 0) {
      this.table.remove(pid);
    }
  }

  /**
   * Remove block from memory using key
   *
   * @param key
   */
  public removeByKey(key: string) {
    const [pid, index] = key.split(":").map((current) => Number(current));
    this.remove(pid, index);
  }

  /**
   * Remove all blocks from memory that have pid process as parent
   *
   * @param pid
   */
  public removeByPid(pid: number) {
    this.table.remove(pid);
  }
}
