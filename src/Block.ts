export class Block {
  private readonly pid: number;
  private readonly id: number;

  constructor(pid: number, id: number) {
    this.pid = pid;
    this.id = id;
  }

  /**
   * Get process id
   *
   * @returns
   */
  public getPid(): number {
    return this.pid;
  }

  /**
   * Get block id
   *
   * @returns
   */
  public getId(): number {
    return this.id;
  }
}
