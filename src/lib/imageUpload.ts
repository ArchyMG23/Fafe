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
    logo: { max: 512, type: 'image/png', limit: 150000 },
    favicon: { max: 128, type: 'image/png', limit: 150000 },
    avatar: { max: 300, type: 'image/jpeg', limit: 60000 },
    cms: { max: 800, type: 'image/jpeg', limit: 120000 },
    product: { max: 1000, type: 'image/jpeg', limit: 200000 },
  };
  const config = configs[kind];

  // 4. Compression/Redimensionnement
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  let scale = Math.min(1, config.max / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Erreur de traitement image.');
  
  // Fond blanc pour JPEG
  if (config.type === 'image/jpeg') {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let quality = 0.75;
  let dataUrl = canvas.toDataURL(config.type, quality);

  // 5. Ajustement si dépassement de limite
  while (dataUrl.length > config.limit && quality > 0.1) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL(config.type, quality);
  }

  if (dataUrl.length > config.limit) {
    throw new Error('Image trop lourde, choisissez une image plus petite');
  }

  return dataUrl;
}
