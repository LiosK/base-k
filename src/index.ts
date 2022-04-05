/** Represents a base-_k_ binary-to-text encoder-decoder. */
export class BaseK {
  /** `log2(256) / log2(radix)` used to determine the size of output. */
  private readonly log2Ratio: number;

  /** O(1) map from ASCII code points to digit values. */
  private readonly decodeMap: Uint8Array;

  /** Creates an encoder-decoder object from a digit set. */
  constructor(private readonly digits: string, caseInsensitiveDecoder = false) {
    const radix = digits.length;
    if (radix < 2 || radix > 128) {
      throw new RangeError("number of digits too small or large");
    } else if (new Set(digits).size !== radix) {
      throw new SyntaxError("duplicate characters in digits");
    }

    this.log2Ratio = Math.log2(256) / Math.log2(radix);

    // Build O(1) map from ASCII code points to digit values
    this.decodeMap = new Uint8Array(128).fill(0xff);
    if (!caseInsensitiveDecoder) {
      for (let i = 0; i < radix; i++) {
        const c = digits.charCodeAt(i);
        if (c > 127) {
          throw new SyntaxError("digit character out of ASCII range");
        }
        this.decodeMap[c] = i;
      }
    } else {
      const uc = digits.toUpperCase();
      const lc = digits.toLowerCase();
      for (let i = 0; i < radix; i++) {
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
  encode(bytes: Uint8Array, outSize?: number): string {
    outSize ??= Math.ceil(bytes.length * this.log2Ratio);
    const out = convertRadix(bytes, 256, this.digits.length, outSize);

    let text = "";
    for (let e of out) {
      text += this.digits.charAt(e);
    }
    return text;
  }

  /** Decodes text to a byte array. */
  decode(text: string, outSize?: number): Uint8Array {
    outSize ??= Math.ceil(text.length / this.log2Ratio);
    const src = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      const c = this.decodeMap[text.charCodeAt(i)] ?? 0xff;
      if (c >= this.digits.length) {
        throw new SyntaxError("invalid character");
      }
      src[i] = c;
    }
    return convertRadix(src, this.digits.length, 256, outSize);
  }
}

/** Converts a digit value array in `srcRadix` to that in `dstRadix`. */
const convertRadix = (
  src: Uint8Array,
  srcRadix: number,
  dstRadix: number,
  outSize: number
): Uint8Array => {
  const maxPower = Number.MAX_SAFE_INTEGER / (srcRadix * dstRadix);
  const dst = new Uint8Array(outSize);
  let minIndex = outSize;
  for (let i = 0, carry = 0; i < src.length; ) {
    // Reset carry to input (read multiple digits for optimization)
    let power = 1; // Set to srcRadix ** number of digits read
    while (power < maxPower && i < src.length) {
      carry = carry * srcRadix + src[i++];
      power *= srcRadix;
    }
    // console.assert(power * dstRadix <= Number.MAX_SAFE_INTEGER);

    // Iterate over dst from right to left while carry != 0 but at least up to
    // place already filled
    let j = dst.length - 1;
    for (; carry > 0 || j > minIndex; j--) {
      if (j < 0) {
        throw new RangeError("outSize too small");
      }
      carry += dst[j] * power;
      const quo = Math.trunc(carry / dstRadix);
      dst[j] = carry - quo * dstRadix; // remainder
      carry = quo;
    }
    minIndex = j;
    // console.assert(carry === 0 && minIndex >= -1);
  }
  return dst;
};
