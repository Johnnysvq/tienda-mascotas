import { api } from "../../lib/api";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  signature: string;
}

export async function uploadProductImage(file: File): Promise<string> {
  const sig = await api<UploadSignature>("/images/signature", {
    method: "POST",
  });

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("signature", sig.signature);
  body.append("folder", sig.folder);
  body.append("allowed_formats", sig.allowedFormats);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/image/upload`,
    { method: "POST", body },
  );
  if (!res.ok) throw new Error("Cloudinary rechazó la subida");

  const data = (await res.json()) as { public_id?: string };
  if (!data.public_id) throw new Error("Respuesta inesperada de Cloudinary");
  return data.public_id;
}
