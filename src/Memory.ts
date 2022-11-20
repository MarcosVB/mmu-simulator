import { Block } from "./Block";
import { Table } from "./Table";

export class Memory {
  private readonly blockMap: Table<string, Block>;
  private readonly processBlockMap: Table<number, Set<number>>;

  constructor(size: number, blockSize: number) {
    this.blockMap = new Table(size / blockSize);
    this.processBlockMap = new Table(size / blockSize);
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
    const processBlocks = this.processBlockMap.get(block.getPid()) ?? new Set();
    processBlocks.add(block.getId());

    this.processBlockMap.add(block.getPid(), processBlocks);
    this.blockMap.add(
      this.createBlockKey(block.getPid(), block.getId()),
      block
    );
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
   * @param key
   * @returns
   */
  public get(key: string) {
    return this.blockMap.get(key);
  }

  /**
   * Get block keys
   *
   * @returns
   */
  public getKeys() {
    return this.blockMap.getKeys();
  }

  /**
   * Get current memory load
   *
   * @returns
   */
  public getLoad() {
    return this.blockMap.getSize() / this.blockMap.getMaxSize();
  }

  /**
   * Check if memory can load n amount of blocks
   *
   * @param amount
   * @returns
   */
  public hasCapacity(amount: number) {
    return this.blockMap.getMaxSize() >= this.blockMap.getSize() + amount;
  }

  /**
   * Ckech if memory is full
   *
   * @returns
   */
  public isFull() {
    return this.blockMap.isFull();
  }

  /**
   * Remove block from memory using pid and index
   *
   * @param pid
   * @param index
   */
  public remove(pid: number, index: number) {
    const set = this.processBlockMap.get(pid);
    if (set) {
      set.delete(index);
      if (set.size === 0) {
        this.processBlockMap.remove(pid);
      }
    }
    this.blockMap.remove(this.createBlockKey(pid, index));
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
    const indexes = this.processBlockMap.get(pid);
    indexes?.forEach((index) =>
      this.blockMap.remove(this.createBlockKey(pid, index))
    );

    this.processBlockMap.remove(pid);
  }
}
