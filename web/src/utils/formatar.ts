/** 0.293 -> "29%" (ou "29.3%" com d = 1). */
export const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;

/** "2026-11-27" -> "27/11/2026" */
export const dataBR = (iso: string) => iso.split("-").reverse().join("/");
