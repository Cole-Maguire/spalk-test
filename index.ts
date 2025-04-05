import { pid } from "process";
import { parseBuffer } from "./packets";

let data: Buffer<ArrayBufferLike> = Buffer.from([]);
process.stdin.on("data", (chunk) => {
  // this will absolutely churn memory, but todo if theres a way to know the full size of the file before reaching the end
  data = Buffer.concat([data, chunk]);
});

process.stdin.on("end", () => {
  const result = parseBuffer(data);
  // need to explicitly check true, not just truthy for TS to infer the type
  if (result.ok === true) {
    result.pids.forEach((pid) => console.log(pid));
    process.exit(0);
  } else {
    console.error(result.error);
    process.exit(1);
  }
});
