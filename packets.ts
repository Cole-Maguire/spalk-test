import { MissingSyncByteError } from "./models/MissingSyncByteError";

const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const FLAG_MASK = 0x1f;

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

type ParseResult = { ok: true; pids: string[] } | { ok: false; error: string };
export function parseBuffer(buffer: Buffer): ParseResult {
  const syncByte = buffer.at(0);
  if (syncByte !== SYNC_BYTE) {
    //todo here
  }

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
      return { ok: false, error: e.message };
    } else {
      throw e;
    }
  }

  let uniquePIDs = [...new Set(allPIDs.sort())].map(
    (pid) => `0x${pid.toString(16)}`
  );

  return { ok: true, pids: uniquePIDs };
}
