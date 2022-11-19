import { Block } from "./Block";
import { Process } from "./Process";
import { Table } from "./Table";

export class MemoryManagementUnity {
  private readonly blockSize: number;
  private readonly ram: Table<string, Block>;
  private readonly vram: Table<number, Table<number, Block>>;

  constructor(ramSize: number, vramSize: number, blockSize: number) {
    this.blockSize = blockSize;
    this.ram = new Table(ramSize / blockSize);
    this.vram = new Table(vramSize / blockSize);
  }

  public add(process: Process): boolean {
    return this.vram.add(process.getId(), this.createBlockTable(process));
  }

  private createBlockKey(pid: number, index: number): string {
    return `${pid}:${index}`;
  }

  private createBlockTable(process: Process): Table<number, Block> {
    const blockAmount = Math.ceil(process.getSize() / this.blockSize);

    const table = new Table<number, Block>(blockAmount);

    for (let index = 0; index < blockAmount; index++) {
      table.add(index, new Block(process.getId(), index));
    }

    return table;
  }

  public load(pid: number, index: number): Block {
    const block = this.ram.get(this.createBlockKey(pid, index));

    if (block) {
      return block;
    }

    if (this.ram.isFull()) {
      this.unload();
    }

    const loadedBlock = this.vram.get(pid)?.get(index);

    if (!loadedBlock) {
      throw new Error(`Could not find block - pid: ${pid}, index: ${index}`);
    }

    this.ram.add(this.createBlockKey(pid, index), loadedBlock);

    return loadedBlock;
  }

  public remove(pid: number): boolean {
    const processTable = this.vram.get(pid);

    if (!processTable) {
      return false;
    }

    for (let index = 0; index < processTable.getSize(); index++) {
      this.ram.remove(this.createBlockKey(pid, index));
    }

    return this.vram.remove(pid);
  }

  private unload(): boolean {
    const keys = this.ram.getKeys();

    return this.ram.remove(keys[0]);
  }
}
