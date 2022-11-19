import { Block } from "./Block";
import { Memory } from "./Memory";
import { Process } from "./Process";

export class MemoryManagementUnity {
  private readonly blockSize: number;
  private readonly ram: Memory;
  private readonly vram: Memory;

  constructor(ramSize: number, vramSize: number, blockSize: number) {
    this.blockSize = blockSize;
    this.ram = new Memory(ramSize, blockSize);
    this.vram = new Memory(vramSize, blockSize);
  }

  public add(process: Process): void {
    this.vram.addBatch(this.createBlocks(process));
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
    const key = keys[(Math.random() * keys.length) | 0];
    const block = this.vram.get(key);
    this.load(block.getPid(), block.getId());
  }

  public getRamLoad() {
    return this.ram.getLoad();
  }

  public getVRamLoad() {
    return this.vram.getLoad();
  }

  public load(pid: number, index: number): Block {
    console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)}`);
    const block = this.ram.get(this.createBlockKey(pid, index));

    if (block) {
      console.log(`[LOAD]   Page ${this.createBlockKey(pid, index)} - Already in memory`);
      return block;
    }

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
    const keys = this.ram.getKeys();
    console.log(`[UNLOAD] Page ${keys[0]}`);
    this.ram.removeByKey(keys[0]);
  }
}
