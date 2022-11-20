import { PROCESS_MAX_SIZE, PROCESS_MIN_SIZE } from "./constants";

export class Process {
  private readonly id: number;
  private readonly size: number;

  constructor(id: number, size: number) {
    if (size < PROCESS_MIN_SIZE || size > PROCESS_MAX_SIZE) {
      throw new Error(
        `Process size is out of valid range: ${PROCESS_MIN_SIZE} <= ${size} <= ${PROCESS_MAX_SIZE}`
      );
    }
    this.id = id;
    this.size = size;
  }

  public getId(): number {
    return this.id;
  }

  public getSize(): number {
    return this.size;
  }
}
