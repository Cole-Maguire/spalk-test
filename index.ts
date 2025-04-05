import { MissingSyncByteError } from "./models/MissingSyncByteError";

const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const FLAG_MASK = 0x1f;

let data: Buffer<ArrayBufferLike> = Buffer.from([]);
process.stdin.on("data", (chunk) => {
  // this will absolutely churn memory, but todo if theres a way to know the full size of the file before reaching the end
  data = Buffer.concat([data, chunk]);
});

process.stdin.on("end", () => {
  const success = parseBuffer(data);
  process.exit(success ? 0 : 1);
});

function parsePacket(buffer: Buffer, packet: number): number {
  if (buffer.at(0) !== SYNC_BYTE) {
    throw new MissingSyncByteError(
      `Error: No sync byte present in packet ${packet}, offset ${
        packet * PACKET_SIZE
      }`
    );
  }
  // get rid of the flags from byte 2 and append byte 3 to the end of it
  const pid = ((buffer.at(1) & FLAG_MASK) << 8) | buffer.at(2);
  return pid;
}

function parseBuffer(buffer: Buffer): boolean {
  const syncByte = buffer.at(0);
  if (syncByte !== SYNC_BYTE) {
    //todo here
  } else {
    const numberOfPackets = Math.ceil(buffer.length / PACKET_SIZE); //todo: floor?
    let allPIDs: number[];
    try {
      allPIDs = Array.from(Array(numberOfPackets).keys()).map((i) => {
        const packet = buffer.subarray(i * PACKET_SIZE, (i + 1) * PACKET_SIZE);
        return parsePacket(packet, i);
      });
    } catch (e) {
      if (e instanceof MissingSyncByteError) {
        console.error(e.message);
        return false;
      } else {
        throw e;
      }
    }

    let uniquePIDs = [...new Set(allPIDs.sort())];
    uniquePIDs.forEach((pid) => console.log(`0x${pid.toString(16)}`));
  }
  return true;
}
