/**
 * Compress an image file to reduce size for storage efficiency and fast loading.
 * Target: max 800px width, JPEG quality 0.7, max ~200KB output.
 */
export const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));
            const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};
