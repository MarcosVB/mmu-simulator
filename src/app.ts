import * as asciichart from "asciichart";
import { RAM_SIZE, VRAM_SIZE, BLOCK_SIZE, PROCESS_MAX_SIZE } from "./constants";
import { MemoryManagementUnity } from "./MemoryManagementUnit";
import { Process } from "./Process";

enum parameter {
  processCount,
  iterations,
  exponentialDistribution,
}

var args = process.argv.slice(2);

const PROCESS_COUNT = args[parameter.processCount]
  ? Number(args[parameter.processCount])
  : 2;
const ITERATIONS = args[parameter.iterations]
  ? Number(args[parameter.iterations])
  : 100;
const EXPONENTIAL_DISTRIBUTION = args[parameter.exponentialDistribution]
  ? Number(args[parameter.exponentialDistribution])
  : 8;

const mmu = new MemoryManagementUnity(RAM_SIZE, VRAM_SIZE, BLOCK_SIZE);

const processMocks: Process[] = [];
const ramLoad: number[] = [];
const vramLoad: number[] = [];

const randomExponential = () =>
  Math.pow(Math.random(), EXPONENTIAL_DISTRIBUTION);
const randomProcessSize = () =>
  Math.max(1, (randomExponential() * PROCESS_MAX_SIZE) | 0);

const saveLoadInfo = () => {
  ramLoad.push(mmu.getRamLoad() * 100);
  vramLoad.push(mmu.getVRamLoad() * 100);
};

for (let i = 0; i < PROCESS_COUNT; i++) {
  processMocks.push(new Process(i, randomProcessSize()));
}

saveLoadInfo();

for (const processMock of processMocks) {
  mmu.add(processMock);
  saveLoadInfo();
}

for (let i = 0; i < ITERATIONS; i++) {
  mmu.createDemand();
  saveLoadInfo();
}

console.log(`--- ${ITERATIONS} iterations`);
console.log(`Page access count: ${mmu.getPageAccessCount()}`);
console.log(`Page fault count: ${mmu.getPageFaultCount()}`);
console.log(`Page swap count: ${mmu.getPageSwapCount()}`);
console.log();
console.log(" VRAM x RAM - (%)");

console.log(
  asciichart.plot([vramLoad, ramLoad], {
    colors: [asciichart.green, asciichart.red],
    height: 10,
  })
);

console.log("VRAM: green, RAM: red");
