export type DetectedFileKind =
  | "pdf"
  | "doc"
  | "docx"
  | "jpeg"
  | "png"
  | "zip"
  | "svg"
  | "executable"
  | "unknown";

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[index] === value);
}

export function detectFileKindFromBytes(bytes: Uint8Array): DetectedFileKind {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "pdf";
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  ) {
    return "doc";
  }

  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return "zip";
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }

  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return "executable";
  }

  if (bytes.length >= 4 && bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
    return "executable";
  }

  const headText = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, Math.min(bytes.length, 256)))
    .trimStart()
    .toLowerCase();

  if (headText.startsWith("<svg") || headText.includes("<svg")) {
    return "svg";
  }

  return "unknown";
}

export function isZipDocx(bytes: Uint8Array): boolean {
  if (!startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return false;
  }
  const sample = new TextDecoder("utf-8", { fatal: false }).decode(
    bytes.slice(0, Math.min(bytes.length, 4096)),
  );
  return sample.includes("word/") || sample.includes("[Content_Types].xml");
}

export function isPasswordProtectedPdf(bytes: Uint8Array): boolean {
  const sample = new TextDecoder("latin1", { fatal: false }).decode(
    bytes.slice(0, Math.min(bytes.length, 65536)),
  );
  return /\/Encrypt\s+\d+\s+\d+\s+R/.test(sample);
}
