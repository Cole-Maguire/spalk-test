const SYNC_BYTE = 0x47;
const PACKET_SIZE = 188;
const FLAG_MASK = 0x1f;

process.stdin.on("data", (data) => {
  const success = parseBuffer(data);
  process.exit(success ? 0 : 1);
});

function parsePacket(buffer: Buffer, packet: number): number {
  const syncByte = buffer.at(0);
  if (syncByte !== SYNC_BYTE) {
    throw new Error(
      `Error: No sync byte present in packet ${packet}, offset ${
        packet * PACKET_SIZE
      }`
    );
  }
  console.debug(
    buffer.at(1).toString(16),
    FLAG_MASK.toString(16),
    buffer.at(2).toString(16)
  );
  const pidInt = ((buffer.at(1) & FLAG_MASK) << 3) | buffer.at(2);
  return pidInt;
}

function parseBuffer(buffer: Buffer): boolean {
  const syncByte = buffer.at(0);
  if (syncByte !== SYNC_BYTE) {
    console.log(`Error: No sync byte present in packet 0, offset 0`);
    return false;
  } else {
    const numberOfPackets = Math.ceil(buffer.length / PACKET_SIZE); //todo: floor?

    let allIDs = Array.from(Array(numberOfPackets).keys())
      .map((i) => {
        const packet = buffer.subarray(i * PACKET_SIZE, (i + 1) * PACKET_SIZE);
        return parsePacket(packet, i);
      })
      .sort();

    let uniqueIDs = [...new Set(allIDs)];
    uniqueIDs.forEach((id) => console.log(`0x${id.toString(16)}`));
  }
  return true;
}
