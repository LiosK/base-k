/** Represents a base-_k_ binary-to-text encoder-decoder. */
export declare class BaseK {
    private readonly digits;
    /** Number of digits (a.k.a. base). */
    private readonly radix;
    /** `log2(256) / log2(radix)` used to determine the size of output. */
    private readonly log2Ratio;
    /** O(1) map from ASCII code points to digit values. */
    private readonly decodeMap;
    /** Creates an encoder-decoder object from a digit set. */
    constructor(digits: string, caseInsensitiveDecoder?: boolean);
    /** Encodes a byte array to text. */
    encode(bytes: Uint8Array): string;
    /** Decodes text to a byte array. */
    decode(text: string): Uint8Array;
}
