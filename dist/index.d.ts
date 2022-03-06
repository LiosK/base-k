/** Represents a base-_k_ binary-to-text encoder-decoder. */
export declare class BaseK {
    private readonly digits;
    /** `log2(256) / log2(radix)` used to determine the size of output. */
    private readonly log2Ratio;
    /** O(1) map from ASCII code points to digit values. */
    private readonly decodeMap;
    /** Creates an encoder-decoder object from a digit set. */
    constructor(digits: string, caseInsensitiveDecoder?: boolean);
    /** Encodes a byte array to text. */
    encode(bytes: Uint8Array, outSize?: number): string;
    /** Decodes text to a byte array. */
    decode(text: string, outSize?: number): Uint8Array;
}
