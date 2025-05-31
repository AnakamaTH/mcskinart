document.getElementById('generateBtn').onclick = async () => {
  const baseFile = document.getElementById('baseSkinInput').files[0];
  const mapFile = document.getElementById('mapInput').files[0];

  if (!mapFile) {
    alert("Please upload a map image!");
    return;
  }

  // Load an image from a file (File object)
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up after load
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }

  // Resize an image to width x height and return a canvas element
  function resizeImage(img, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  }

  // Create blank transparent skin canvas 64x64
  function createBlankSkin(width = 64, height = 64) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // Transparent by default, no fill needed
    return canvas;
  }

  let baseImgCanvas;
  if (baseFile) {
    const baseImg = await loadImage(baseFile);
    baseImgCanvas = resizeImage(baseImg, 64, 64); // Ensure base skin is 64x64
  } else {
    baseImgCanvas = createBlankSkin(64, 64);
  }

  const mapImg = await loadImage(mapFile);
  const resizedMapCanvas = resizeImage(mapImg, 72, 24);

  // We need context of resizedMap to extract faces
  const mapCtx = resizedMapCanvas.getContext('2d');

  const zip = new JSZip();

  for (let i = 0; i < 27; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw base skin from canvas to canvas
    ctx.drawImage(baseImgCanvas, 0, 0);

    // Calculate coords on map image for face cutout
    const sx = (i % 9) * 8;
    const sy = Math.floor(i / 9) * 8;

    // Get 8x8 face image data from map
    const faceImageData = mapCtx.getImageData(sx, sy, 8, 8);

    // Put face image data onto base skin at (8,8)
    ctx.putImageData(faceImageData, 8, 8);

    // Convert canvas to Blob (PNG)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Name the files: 27..1, except last is optional_skin.png
    const filename = i === 26 ? 'optional_skin.png' : `skin_${27 - i}.png`;

    zip.file(filename, blob);
  }

  // Generate zip and trigger save
  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'namemc_skinart.zip');
    document.getElementById('status').textContent = 'Skins generated successfully!';
  }).catch(err => {
    alert('Error generating zip: ' + err.message);
  });
};
