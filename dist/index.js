/** Represents a base-_k_ binary-to-text encoder-decoder. */
export class BaseK {
    /** Creates an encoder-decoder object from a digit set. */
    constructor(digits, caseInsensitiveDecoder = false) {
        this.digits = digits;
        this.radix = digits.length;
        this.log2Radix = Math.log2(this.radix);
        if (this.radix < 2 || this.radix > 128) {
            throw new RangeError("number of digits too small or large");
        }
        else if (new Set(digits).size !== this.radix) {
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
        }
        else {
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
    encode(bytes) {
        const len = Math.ceil((bytes.length * 8) / this.log2Radix);
        const out = new Uint8Array(len);
        for (let i = 0; i < bytes.length; i++) {
            let carry = bytes[i];
            for (let j = len - 1; j >= 0; j--) {
                carry += out[j] * 0x100;
                out[j] = carry % this.radix;
                carry = Math.trunc(carry / this.radix);
            }
        }
        let text = "";
        for (let e of out) {
            text += this.digits[e];
        }
        return text;
    }
    /** Decodes text to a byte array. */
    decode(text) {
        var _a;
        const len = Math.ceil((text.length / 8) * this.log2Radix);
        const out = new Uint8Array(len);
        for (let i = 0; i < text.length; i++) {
            let carry = (_a = this.decodeMap[text.charCodeAt(i)]) !== null && _a !== void 0 ? _a : 0xff;
            if (carry >= this.radix) {
                throw new SyntaxError("invalid character");
            }
            for (let j = len - 1; j >= 0; j--) {
                carry += out[j] * this.radix;
                out[j] = carry % 0x100;
                carry = Math.trunc(carry / 0x100);
            }
        }
        return out;
    }
}
