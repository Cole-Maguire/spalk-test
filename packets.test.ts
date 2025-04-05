import { expect, test, describe } from "vitest";
import { parseBuffer } from "./packets";
import fs from "fs";

test("parses a normal file correctly", () => {
  const pids = [
    "0x0",
    "0x11",
    "0x20",
    "0x21",
    "0x22",
    "0x23",
    "0x24",
    "0x25",
    "0x1fff",
  ];
  const buffer = fs.readFileSync("./resources/test_success.bin");
  const result = parseBuffer(buffer);
  expect(result).toStrictEqual({ ok: true, pids: pids });
});

test("fails when parsing an invalid input", () => {
  const buffer = fs.readFileSync("./resources/test_failure.bin");
  const result = parseBuffer(buffer);
  expect(result).toStrictEqual({
    ok: false,
    error: "Error: No sync byte present in packet 20535, offset 3860580",
  });
});

test("Empty file", () => {
  // undefined behaviour, but should be handled gracefully
  const buffer = Buffer.from([]);
  const result = parseBuffer(buffer);
  expect(result).toStrictEqual({
    ok: true,
    pids: [],
  });
});

test("Single packet file", () => {
  const pids = ["0x21"];
  const buffer = fs.readFileSync("./resources/test_success_one_packet.bin");
  const result = parseBuffer(buffer);
  expect(result).toStrictEqual({ ok: true, pids: pids });
});

describe("Parses a file with a corrupted first packet", () => {
  test("First packet is missing starting bytes", () => {
    const pids = [
      "0x0",
      "0x11",
      "0x20",
      "0x21",
      "0x22",
      "0x23",
      "0x24",
      "0x25",
      "0x1fff",
    ];
    const buffer = fs.readFileSync(
      "./resources/test_success_missing_start.bin"
    );
    const result = parseBuffer(buffer);
    expect(result).toStrictEqual({ ok: true, pids: pids });
  });

  test("First packet is missing starting bytes, with red herring sync byte ", () => {
    const pids = [
      "0x0",
      "0x11",
      "0x20",
      "0x21",
      "0x22",
      "0x23",
      "0x24",
      "0x25",
      "0x1fff",
    ];
    const buffer = fs.readFileSync(
      "./resources/test_success_red_herring_sync.bin"
    );
    const result = parseBuffer(buffer);
    expect(result).toStrictEqual({ ok: true, pids: pids });
  });

  test("First packet is missing ending bytes", () => {
    const pids = [
      "0x0",
      "0x11",
      "0x20",
      "0x21",
      "0x22",
      "0x23",
      "0x24",
      "0x25",
      "0x521",
      "0x1fff",
    ];
    const buffer = fs.readFileSync(
      "./resources/test_success_short_first_byte.bin"
    );
    const result = parseBuffer(buffer);
    expect(result).toStrictEqual({ ok: true, pids: pids });
  });
});
