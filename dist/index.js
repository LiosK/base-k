/** Represents a base-_k_ binary-to-text encoder-decoder. */
export class BaseK {
    /** Creates an encoder-decoder object from a digit set. */
    constructor(digits, caseInsensitiveDecoder = false) {
        this.digits = digits;
        const radix = digits.length;
        if (radix < 2 || radix > 128) {
            throw new RangeError("number of digits too small or large");
        }
        else if (new Set(digits).size !== radix) {
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
        }
        else {
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
    encode(bytes, outSize) {
        outSize !== null && outSize !== void 0 ? outSize : (outSize = Math.ceil(bytes.length * this.log2Ratio));
        const out = convertRadix(bytes, 256, this.digits.length, outSize);
        let text = "";
        for (let e of out) {
            text += this.digits[e];
        }
        return text;
    }
    /** Decodes text to a byte array. */
    decode(text, outSize) {
        var _a;
        outSize !== null && outSize !== void 0 ? outSize : (outSize = Math.ceil(text.length / this.log2Ratio));
        const src = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            const c = (_a = this.decodeMap[text.charCodeAt(i)]) !== null && _a !== void 0 ? _a : 0xff;
            if (c >= this.digits.length) {
                throw new SyntaxError("invalid character");
            }
            src[i] = c;
        }
        return convertRadix(src, this.digits.length, 256, outSize);
    }
}
/** Converts a digit value array in `srcRadix` to that in `dstRadix`. */
const convertRadix = (src, srcRadix, dstRadix, outSize) => {
    const dst = new Uint8Array(outSize);
    let dstUsed = dst.length - 1;
    for (let i = 0, carry = 0; i < src.length;) {
        // Reset carry to input (read multiple digits for optimization)
        let power = 1; // Set to srcRadix ** number of digits read
        while (power < 2 ** 36 && i < src.length) {
            carry = carry * srcRadix + src[i++];
            power *= srcRadix;
        }
        // Iterate over dst from right while carry != 0 or up to place already used
        let j = dst.length - 1;
        for (; carry > 0 || j >= dstUsed; j--) {
            if (j < 0) {
                throw new RangeError("outSize too small");
            }
            carry += dst[j] * power;
            dst[j] = carry % dstRadix;
            carry = Math.trunc(carry / dstRadix);
        }
        dstUsed = j + 1;
        // assert(carry === 0 && dstUsed >= 0);
    }
    return dst;
};
