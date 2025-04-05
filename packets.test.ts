import { expect, test } from "vitest";
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
