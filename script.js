document.getElementById('generateBtn').onclick = async () => {
  const baseFile = document.getElementById('baseSkinInput').files[0];
  const mapFile = document.getElementById('mapInput').files[0];

  if (!mapFile) {
    alert("Please upload a map image!");
    return;
  }

  // Helper to load an image from a File or URL
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Helper to resize an image to specified width and height, returns a Canvas
  function resizeImage(img, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, width, height);
    return Promise.resolve(canvas);
  }

  // Helper to create a blank transparent 64x64 canvas as base skin
  function createBlankSkin(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return Promise.resolve(canvas);
  }

  const baseImg = baseFile ? await loadImage(baseFile) : await createBlankSkin(64, 64);
  const mapImg = await loadImage(mapFile);
  const resizedMap = await resizeImage(mapImg, 72, 24);

  // Create temporary canvas to read pixel data from resizedMap
  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = resizedMap.width;
  mapCanvas.height = resizedMap.height;
  const mapCtx = mapCanvas.getContext('2d');
  mapCtx.drawImage(resizedMap, 0, 0);

  const zip = new JSZip();

  for (let i = 0; i < 27; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Draw base skin image (could be canvas or image)
    if (baseImg instanceof HTMLCanvasElement) {
      ctx.drawImage(baseImg, 0, 0);
    } else {
      ctx.drawImage(baseImg, 0, 0, 64, 64);
    }

    // Calculate the map's face coordinates
    const sx = (i % 9) * 8;
    const sy = Math.floor(i / 9) * 8;

    // Extract 8x8 face pixels from map canvas
    const face = mapCtx.getImageData(sx, sy, 8, 8);
    ctx.putImageData(face, 8, 8); // Paste face onto base skin at (8,8)

    // Convert canvas to Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Name skins from 27 down to 1, except last is optional_skin.png
    const name = i === 26 ? 'optional_skin.png' : `skin_${27 - i}.png`;

    zip.file(name, blob);
  }

  // Generate zip and trigger download
  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'namemc_skinart.zip');
    document.getElementById('status').textContent = 'Skins generated successfully!';
  });
};
