import { Block } from "./Block";
import { Table } from "./Table";

export class Memory {
    private readonly blockMap: Table<string, Block>;
    private readonly processBlockMap: Table<number, Set<number>>;

    constructor(size: number, blockSize: number) {
        this.blockMap = new Table(size / blockSize);
        this.processBlockMap = new Table(size / blockSize);
    }

    public add(block: Block): void {
        if (this.isFull()) {
            throw new Error("Memory is full!");
        }

        this.addBlock(block);
    }

    public addBatch(blocks: Block[]) {
        if (!this.hasCapacity(blocks.length)) {
            throw new Error("Memory overflow!");
        }

        blocks.forEach(block=>this.addBlock(block));
    }

    private addBlock(block: Block): void {
        const processBlocks = this.processBlockMap.get(block.getPid()) ?? new Set();
        processBlocks.add(block.getId());

        this.processBlockMap.add(block.getPid(), processBlocks);
        this.blockMap.add(this.createBlockKey(block.getPid(), block.getId()), block);
    }

    private createBlockKey(pid: number, index: number): string {
        return `${pid}:${index}`;
    }

    public get(key: string) {
        return this.blockMap.get(key);
    }

    public getKeys() {
        return this.blockMap.getKeys();
    }

    public getLoad() {
        return this.blockMap.getSize() / this.blockMap.getMaxSize();
    }
    
    public hasCapacity(amount: number) {
        return this.blockMap.getMaxSize() >= this.blockMap.getSize() + amount;
    }

    public isFull() {
        return this.blockMap.isFull();
    }

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

    public removeByKey(key: string) {
        const [pid, index] = key.split(":").map(current=>Number(current));
        this.remove(pid, index);
    }

    public removeByPid(pid: number) {
        const indexes = this.processBlockMap.get(pid);
        indexes?.forEach(index=>this.blockMap.remove(this.createBlockKey(pid, index)));

        this.processBlockMap.remove(pid);
    }
}
