import { Block } from "./Block";
import { Memory } from "./Memory";
import { Process } from "./Process";

export class MemoryManagementUnity {
  private readonly blockSize: number;
  private readonly ram: Memory;
  private readonly vram: Memory;
  private pageAccessCount: number;
  private pageFaultCount: number;
  private pageSwapCount: number;

  constructor(ramSize: number, vramSize: number, blockSize: number) {
    this.blockSize = blockSize;
    this.ram = new Memory(ramSize, blockSize);
    this.vram = new Memory(vramSize, blockSize);
    this.pageAccessCount = 0;
    this.pageFaultCount = 0;
    this.pageSwapCount = 0;
  }

  /**
   * Load process into vram
   *
   * @param process
   * @returns
   */
  public add(process: Process): boolean {
    const blocks = this.createBlocks(process);

    if (!this.vram.hasCapacity(blocks.length)) {
      console.log(
        `Cannot load process in VRAM -> pid: ${process.getId()}, size: ${process.getSize()}`
      );
      return false;
    }

    this.vram.addBatch(this.createBlocks(process));
    return true;
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
   * Break process into blocks to representing it
   *
   * @param process
   * @returns
   */
  private createBlocks(process: Process): Block[] {
    const blockAmount = Math.ceil(process.getSize() / this.blockSize);

    const blocks: Block[] = [];

    for (let index = 0; index < blockAmount; index++) {
      blocks.push(new Block(process.getId(), index));
    }

    return blocks;
  }

  /**
   * Generates a random process block demand
   */
  public createDemand() {
    const { pid, index } = this.getRandomBlockInfo(this.vram);
    this.load(pid, index);
  }

  /**
   * Get page access count
   *
   * @returns
   */
  public getPageAccessCount() {
    return this.pageAccessCount;
  }

  /**
   * Get page fault count
   *
   * @returns
   */
  public getPageFaultCount() {
    return this.pageFaultCount;
  }

  /**
   * Get page swap count
   *
   * @returns
   */
  public getPageSwapCount() {
    return this.pageSwapCount;
  }

  /**
   * Get current ram load
   *
   * @returns
   */
  public getRamLoad() {
    return this.ram.getLoad();
  }

  /**
   * Get current vram load
   *
   * @returns
   */
  public getVRamLoad() {
    return this.vram.getLoad();
  }

  /**
   * Get a random block info (pid, index) from memory
   *
   * @param memory
   * @returns
   */
  private getRandomBlockInfo(memory: Memory) {
    const pids = memory.getKeys();

    if (pids.length === 0) {
      console.log(`Memory has no process loaded!`);
    }

    const pid = pids[(Math.random() * pids.length) | 0];
    const indexes = memory.getBlockTable(pid).getKeys();
    const index = indexes[(Math.random() * indexes.length) | 0];

    return { pid, index };
  }

  /**
   * Load block into ram (must be loaded in vram)
   *
   * @param pid
   * @param index
   * @returns
   */
  public load(pid: number, index: number): Block {
    console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)}`);

    this.pageAccessCount++;

    const block = this.ram.get(pid, index);

    if (block) {
      console.log(
        `[LOAD]   Page ${this.createBlockKey(pid, index)} - Already in memory`
      );
      return block;
    }

    this.pageFaultCount++;

    if (this.ram.isFull()) {
      this.unload();
    }

    const loadedBlock = this.vram.get(pid, index);

    if (!loadedBlock) {
      throw new Error(`Could not find block - pid: ${pid}, index: ${index}`);
    }

    this.ram.add(loadedBlock);

    console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)} - Success`);
    return loadedBlock;
  }

  /**
   * Remove process and it's blocks from memory
   *
   * @param pid
   */
  public remove(pid: number) {
    this.ram.removeByPid(pid);
    this.vram.removeByPid(pid);
  }

  /**
   * Unloads a block from ram
   */
  private unload() {
    this.pageSwapCount++;
    const { pid, index } = this.getRandomBlockInfo(this.ram);
    console.log(`[UNLOAD] Page ${pid}:${index}`);
    this.ram.remove(pid, index);
  }
}
