export async function uploadImage(file: File, kind: 'logo' | 'favicon' | 'cms' | 'product' | 'avatar'): Promise<string> {
  // 1. Validation type
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez sélectionner une image valide.');
  }

  // 2. Traitement SVG spécial
  if (file.type === 'image/svg+xml') {
    if (file.size > 100 * 1024) throw new Error('SVG trop lourd (max 100 Ko).');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 3. Paramètres par kind
  const configs = {
    logo: { max: 384, type: 'image/webp', limit: 60000, quality: 0.7 },
    favicon: { max: 64, type: 'image/png', limit: 20000, quality: 0.7 },
    avatar: { max: 200, type: 'image/webp', limit: 30000, quality: 0.7 },
    cms: { max: 640, type: 'image/webp', limit: 70000, quality: 0.7 },
    product: { max: 800, type: 'image/webp', limit: 100000, quality: 0.72 },
  };
  const config = configs[kind];

  // Helper pour vérifier support WebP
  const supportsWebP = await new Promise(resolve => {
    const canvas = document.createElement('canvas');
    resolve(!!canvas.toDataURL('image/webp').startsWith('data:image/webp'));
  });
  
  // Utilise WebP si supporté, sinon fallback au type original
  const finalType = supportsWebP ? 'image/webp' : (kind === 'favicon' ? 'image/png' : 'image/jpeg');

  // 4. Compression/Redimensionnement
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let scale = Math.min(1, config.max / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Erreur de traitement image.');
  
  // Fond blanc pour JPEG (si fallback nécessaire)
  if (finalType === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = config.quality;
  let dataUrl = canvas.toDataURL(finalType, quality);

  // 5. Ajustement si dépassement de limite (qualité puis dimensions)
  let currentMax = config.max;
  while (dataUrl.length > config.limit) {
    if (quality > 0.4) {
      quality -= 0.05;
    } else if (currentMax > config.max / 2) {
      currentMax -= 64;
      quality = config.quality;
      scale = Math.min(1, currentMax / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      throw new Error('Image trop lourde, choisissez une image plus petite');
    }
    dataUrl = canvas.toDataURL(finalType, quality);
  }

  return dataUrl;
}
