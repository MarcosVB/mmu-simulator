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

  public add(process: Process): boolean {
    const blocks = this.createBlocks(process);

    if (!this.vram.hasCapacity(blocks.length)) {
      console.log(
        `Cannot load process with pid: ${process.getId()}, VRAM is full!`
      );
      return false;
    }

    this.vram.addBatch(this.createBlocks(process));
    return true;
  }

  private createBlockKey(pid: number, index: number): string {
    return `${pid}:${index}`;
  }

  private createBlocks(process: Process): Block[] {
    const blockAmount = Math.ceil(process.getSize() / this.blockSize);

    const blocks: Block[] = [];

    for (let index = 0; index < blockAmount; index++) {
      blocks.push(new Block(process.getId(), index));
    }

    return blocks;
  }

  public createDemand() {
    const keys = this.vram.getKeys();

    if (keys.length === 0) {
      console.log(`Cannot create demand, virtual memory is empty!`);
    }

    const key = keys[(Math.random() * keys.length) | 0];
    const block = this.vram.get(key);
    this.load(block.getPid(), block.getId());
  }

  public getPageAccessCount() {
    return this.pageAccessCount;
  }

  public getPageFaultCount() {
    return this.pageFaultCount;
  }

  public getPageSwapCount() {
    return this.pageSwapCount;
  }

  public getRamLoad() {
    return this.ram.getLoad();
  }

  public getVRamLoad() {
    return this.vram.getLoad();
  }

  public load(pid: number, index: number): Block {
    console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)}`);

    this.pageAccessCount++;

    const block = this.ram.get(this.createBlockKey(pid, index));

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

    const loadedBlock = this.vram.get(this.createBlockKey(pid, index));

    if (!loadedBlock) {
      throw new Error(`Could not find block - pid: ${pid}, index: ${index}`);
    }

    this.ram.add(loadedBlock);

    console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)} - Success`);
    return loadedBlock;
  }

  public remove(pid: number) {
    this.ram.removeByPid(pid);
    this.vram.removeByPid(pid);
  }

  private unload() {
    this.pageSwapCount++;
    const keys = this.ram.getKeys();
    console.log(`[UNLOAD] Page ${keys[0]}`);
    this.ram.removeByKey(keys[0]);
  }
}
