# Base-_k_ binary-to-text encoder-decoder

```javascript
import { BaseK } from "base-k";

const base36 = new BaseK("0123456789abcdefghijklmnopqrstuvwxyz");

const bytes = Uint8Array.of(0xab, 0xcd, 0xef);
const encoded = base36.encode(bytes); // "6pbsf"
const decoded = base36.decode(encoded); // Uint8Array(4) [ 0, 171, 205, 239 ]
```
