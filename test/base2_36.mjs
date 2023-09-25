import { BaseK } from "base-k";
const assert = (expression, message = "") => {
  if (!expression) {
    throw new Error("Assertion failed" + (message ? ": " + message : ""));
  }
};

describe("new BaseK(ds) where ds is standard base-2-36 digits", function () {
  const digits = "0123456789abcdefghijklmnopqrstuvwxyz";

  const cases = [new Uint8Array(16).fill(0), new Uint8Array(16).fill(0xff)];
  for (let i = 0; i < 1_000; i++) {
    const len = Math.trunc(Math.random() * 64);
    const bytes = new Uint8Array(len);
    for (let j = 0; j < len; j++) {
      bytes[j] = Math.random() * 256;
    }
    cases.push(bytes);
  }

  const engines = {};
  const encodedCases = {};
  for (let i = 2; i <= 36; i++) {
    engines[i] = new BaseK(digits.substring(0, i), true);
    encodedCases[i] = [];
    for (let e of cases) {
      encodedCases[i].push(engines[i].encode(e));
    }
  }

  it("encodes bytes in the same way as BigInt.prototype.toString(k)", function () {
    const bigints = [];
    for (let i = 0; i < cases.length; i++) {
      bigints[i] = 0n;
      for (let e of cases[i]) {
        bigints[i] *= 256n;
        bigints[i] += BigInt(e);
      }
    }

    for (let i = 2; i <= 36; i++) {
      const log2 = Math.log2(i);
      for (let j = 0; j < cases.length; j++) {
        const len = Math.ceil((cases[j].length * 8) / log2);
        const expected =
          len === 0 ? "" : bigints[j].toString(i).padStart(len, "0");
        assert(encodedCases[i][j] === expected);
      }
    }
  });

  it("decodes encoded text symmetrically", function () {
    for (let i = 2; i <= 36; i++) {
      for (let j = 0; j < cases.length; j++) {
        const actual = engines[i].decode(encodedCases[i][j]);
        assert(
          actual.length === cases[j].length ||
            (actual.length === cases[j].length + 1 && actual[0] === 0),
        );
        const diff = actual.length === cases[j].length ? 0 : 1;
        for (let k = 0; k < cases[j].length; k++) {
          assert(actual[k + diff] === cases[j][k]);
        }
      }
    }
  });

  it("decodes encoded text symmetrically (case-insensitive)", function () {
    for (let i = 2; i <= 36; i++) {
      for (let j = 0; j < cases.length; j++) {
        const actual = engines[i].decode(encodedCases[i][j].toUpperCase());
        assert(
          actual.length === cases[j].length ||
            (actual.length === cases[j].length + 1 && actual[0] === 0),
        );
        const diff = actual.length === cases[j].length ? 0 : 1;
        for (let k = 0; k < cases[j].length; k++) {
          assert(actual[k + diff] === cases[j][k]);
        }
      }
    }
  });

  it("decodes encoded text symmetrically (with outSize argument)", function () {
    for (let i = 2; i <= 36; i++) {
      for (let j = 0; j < cases.length; j++) {
        const actual = engines[i].decode(encodedCases[i][j], cases[j].length);
        assert(actual.length === cases[j].length);
        for (let k = 0; k < cases[j].length; k++) {
          assert(actual[k] === cases[j][k]);
        }
      }
    }
  });
});
