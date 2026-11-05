const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1580913428023-02c695666d61?auto=format&fit=crop&w=900&q=80",
] as const;

export const STORE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";

function pick(seed: string, images: readonly string[]): string {
  let hash = 0;
  for (const character of seed) {
    hash = (hash + character.charCodeAt(0) * 17) % images.length;
  }
  return images[hash] ?? images[0];
}

export function catalogImageUrl(seed: string, storedPath?: string | null): string {
  if (storedPath && /^https?:\/\//.test(storedPath)) {
    return storedPath;
  }

  return pick(seed, PRODUCT_IMAGES);
}
