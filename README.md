# Base-_k_ binary-to-text encoder-decoder

```javascript
import { BaseK } from "base-k";

const base36 = new BaseK("0123456789abcdefghijklmnopqrstuvwxyz");

const bytes = Uint8Array.of(0xab, 0xcd, 0xef);

const e0 = base36.encode(bytes); // "6pbsf"
const d0 = base36.decode(e0); // Uint8Array(4) [ 0, 171, 205, 239 ]

const e1 = base36.encode(bytes, 8); // "0006pbsf"
const d1 = base36.decode(e1, 3); // Uint8Array(3) [ 171, 205, 239 ]
```
