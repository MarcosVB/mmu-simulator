export class Block {
  private readonly pid: number;
  private readonly id: number;

  constructor(pid: number, id: number) {
    this.pid = pid;
    this.id = id;
  }

  public getPid(): number {
    return this.pid;
  }

  public getId(): number {
    return this.id;
  }
}
