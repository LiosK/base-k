/** Represents a base-_k_ binary-to-text encoder-decoder. */
export class BaseK {
  /** Number of digits (a.k.a. base). */
  private readonly radix: number;

  /** `Math.log2(this.radix)` used to determine the size of output. */
  private readonly log2Radix: number;

  /** O(1) map from ASCII code points to digit values. */
  private readonly decodeMap: Uint8Array;

  /** Creates an encoder-decoder object from a digit set. */
  constructor(private readonly digits: string, caseInsensitiveDecoder = false) {
    this.radix = digits.length;
    this.log2Radix = Math.log2(this.radix);

    if (this.radix < 2 || this.radix > 128) {
      throw new RangeError("number of digits too small or large");
    } else if (new Set(digits).size !== this.radix) {
      throw new SyntaxError("duplicate characters in digits");
    }

    // Build O(1) map from ASCII code points to digit values
    this.decodeMap = new Uint8Array(128).fill(0xff);
    if (!caseInsensitiveDecoder) {
      for (let i = 0; i < this.radix; i++) {
        const c = digits.charCodeAt(i);
        if (c > 127) {
          throw new SyntaxError("digit character out of ASCII range");
        }
        this.decodeMap[c] = i;
      }
    } else {
      const uc = digits.toUpperCase();
      const lc = digits.toLowerCase();
      for (let i = 0; i < this.radix; i++) {
        const u = uc.charCodeAt(i);
        const l = lc.charCodeAt(i);
        if (u > 127 || l > 127) {
          throw new SyntaxError("digit character out of ASCII range");
        }
        this.decodeMap[u] = i;
        this.decodeMap[l] = i;
      }
    }
  }

  /** Encodes a byte array to text. */
  encode(bytes: Uint8Array): string {
    const outSize = Math.ceil((bytes.length * 8) / this.log2Radix);
    const out = new Uint8Array(outSize);
    for (let i = 0; i < bytes.length; ) {
      // Reset carry to input (read multiple bytes for optimization)
      let carry = 0;
      let ub = 1; // Set to 256 ** number of read bytes
      while (ub < 0x1_0000_0000 && i < bytes.length) {
        carry = carry * 256 + bytes[i++];
        ub *= 256;
      }

      for (let j = outSize - 1; j >= 0; j--) {
        carry += out[j] * ub;
        out[j] = carry % this.radix;
        carry = Math.trunc(carry / this.radix);
      }

      if (carry !== 0) {
        // TODO add optional param that specifies the size of output array
        throw new RangeError("assertion failed: output array too short");
      }
    }

    let text = "";
    for (let e of out) {
      text += this.digits[e];
    }
    return text;
  }

  /** Decodes text to a byte array. */
  decode(text: string): Uint8Array {
    const outSize = Math.ceil((text.length / 8) * this.log2Radix);
    const out = new Uint8Array(outSize);
    for (let i = 0; i < text.length; ) {
      // Reset carry to input (read multiple digits for optimization)
      let carry = 0;
      let ub = 1; // Set to this.radix ** number of read digits
      while (ub < 0x1_0000_0000 && i < text.length) {
        const c = this.decodeMap[text.charCodeAt(i++)] ?? 0xff;
        if (c >= this.radix) {
          throw new SyntaxError("invalid character");
        }
        carry = carry * this.radix + c;
        ub *= this.radix;
      }

      for (let j = outSize - 1; j >= 0; j--) {
        carry += out[j] * ub;
        out[j] = carry % 256;
        carry = Math.trunc(carry / 256);
      }

      if (carry !== 0) {
        // TODO add optional param that specifies the size of output array
        throw new RangeError("assertion failed: output array too short");
      }
    }

    return out;
  }
}
