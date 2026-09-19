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
    logo: { max: 512, type: 'image/webp', limit: 250000 },
    favicon: { max: 64, type: 'image/png', limit: 40000 },
    avatar: { max: 300, type: 'image/jpeg', limit: 60000 },
    cms: { max: 800, type: 'image/jpeg', limit: 120000 },
    product: { max: 1000, type: 'image/jpeg', limit: 200000 },
  };
  const config = configs[kind];

  // Helper pour vérifier support WebP
  const supportsWebP = await new Promise(resolve => {
    const canvas = document.createElement('canvas');
    resolve(!!canvas.toDataURL('image/webp').startsWith('data:image/webp'));
  });
  const finalType = (kind === 'logo' && supportsWebP) ? 'image/webp' : config.type;

  // 4. Compression/Redimensionnement
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let scale = Math.min(1, config.max / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Erreur de traitement image.');
  
  // Fond blanc pour JPEG
  if (finalType === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.85;
  let dataUrl = canvas.toDataURL(finalType, quality);

  // 5. Ajustement si dépassement de limite (qualité puis dimensions)
  let currentMax = config.max;
  while (dataUrl.length > config.limit) {
    if (quality > 0.6) {
      quality -= 0.05;
    } else if (currentMax > 256) {
      currentMax -= 128;
      quality = 0.85;
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
