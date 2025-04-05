import { MissingSyncByteError } from "./models/MissingSyncByteError";

const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const FLAG_MASK = 0x1f;

type ParseResult = { ok: true; pids: string[] } | { ok: false; error: string };

function calculatePID(buffer: Buffer, packet: number): number {
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

export function parseBuffer(buffer: Buffer): ParseResult {
  if (buffer.length === 0) {
    // I don't think an empty file has defined behaviour, but seems reasonable
    return { ok: true, pids: [] };
  } // an invalid first packet could be missing data from the start (including a missing sync byte)
  else if (buffer.at(0) !== SYNC_BYTE) {
    // we must iterate like this as 0x47 is a valid data byte that could be present in the corrupted first packet (potentially multiple times!)
    // this is very expensive in the very worst case though, so would need to choose if this is appropriate depending on the use case (speed vs accuracy)
    const possibleSyncBytes = [...buffer.subarray(0, PACKET_SIZE + 1)]
      .map((byte, index) => ({ byte, index }))
      .filter(({ byte }) => byte === SYNC_BYTE);

    for (let byte of possibleSyncBytes) {
      let result = parseAlignedBuffer(
        buffer.subarray(byte.index, buffer.length)
      );
      if (result.ok) {
        return result;
      }
    }

    // if we didn't return in the loop above, then more than just the first packet is borked
    return {
      ok: false,
      error: "Error: No sync byte present in packet 0, offset 0",
    };
  }
  // an invalid first packet could be missing data from the end (it starts ok, but stops before 188 bytes)
  else if (
    buffer.at(0) === SYNC_BYTE &&
    buffer.length > PACKET_SIZE && // gotta check - could be a single packet file
    buffer.at(PACKET_SIZE) !== SYNC_BYTE
  ) {
    const firstBytePid = calculatePID(buffer, 0);

    // we must iterate like this as 0x47 is a valid data byte that could be present in the corrupted first packet (potentially multiple times!)
    // this is very expensive in the very worst case though, so would need to choose if this is appropriate depending on the use case (speed vs accuracy)
    const possibleSyncBytes = [...buffer.subarray(1, PACKET_SIZE + 1)]
      .map((byte, index) => ({ byte, index: index + 1 }))
      .filter(({ byte }) => byte === SYNC_BYTE);

    for (let byte of possibleSyncBytes) {
      let result = parseAlignedBuffer(
        buffer.subarray(byte.index, buffer.length),
        firstBytePid
      );
      if (result.ok) {
        return result;
      }
    }

    // if we didn't return in the loop above, then more than just the first packet is borked
    return {
      ok: false,
      error: "Error: No sync byte present in packet 1, offset 188",
    };
  } else {
    // easy case
    return parseAlignedBuffer(buffer);
  }
}

export function parseAlignedBuffer(
  buffer: Buffer,
  additionalPid?: number // only used when the first packet is short of bytes - used so PID distinctness and sorting is still correct
): ParseResult {
  const numberOfPackets = Math.ceil(buffer.length / PACKET_SIZE);

  let allPIDs: number[];
  try {
    allPIDs = Array.from(Array(numberOfPackets).keys()).map((i) => {
      const packet = buffer.subarray(i * PACKET_SIZE, (i + 1) * PACKET_SIZE);
      return calculatePID(packet, i);
    });
  } catch (e) {
    if (e instanceof MissingSyncByteError) {
      return { ok: false, error: e.message };
    } else {
      throw e;
    }
  }

  if (additionalPid) {
    allPIDs.push(additionalPid);
  }

  const uniquePIDs = [...new Set(allPIDs.sort((a, b) => a - b))].map(
    (pid) => `0x${pid.toString(16)}`
  );

  return { ok: true, pids: uniquePIDs };
}
