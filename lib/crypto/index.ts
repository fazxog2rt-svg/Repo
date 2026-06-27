import CryptoJS from "crypto-js";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key && process.env.NODE_ENV === "production" && typeof window === "undefined") {
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("ENCRYPTION_KEY must be set in production");
    }
  }
  return key || "default-key-32-chars-min-length!!";
}

function getEncryptionIV(): string {
  const iv = process.env.ENCRYPTION_IV;
  if (!iv && process.env.NODE_ENV === "production" && typeof window === "undefined") {
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("ENCRYPTION_IV must be set in production");
    }
  }
  return iv || "default-iv-16chr";
}

export function encryptApiKey(apiKey: string): string {
  const key = CryptoJS.enc.Utf8.parse(getEncryptionKey());
  const iv = CryptoJS.enc.Utf8.parse(getEncryptionIV());

  const encrypted = CryptoJS.AES.encrypt(apiKey, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
}

export function decryptApiKey(encryptedKey: string): string {
  const key = CryptoJS.enc.Utf8.parse(getEncryptionKey());
  const iv = CryptoJS.enc.Utf8.parse(getEncryptionIV());

  const decrypted = CryptoJS.AES.decrypt(encryptedKey, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

export function generateSecureToken(length = 32): string {
  const bytes = CryptoJS.lib.WordArray.random(length);
  return bytes.toString(CryptoJS.enc.Hex);
}
