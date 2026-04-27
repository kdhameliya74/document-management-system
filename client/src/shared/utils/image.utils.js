export const createThumbnail = (file, width = 150, height = 150) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/webp",
        0.8,
      );
    };
    img.src = URL.createObjectURL(file);
  });
};
