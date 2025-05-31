document.getElementById('mapInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.width = 72;
    img.height = 24;
    img.style.imageRendering = 'pixelated';

    const preview = document.getElementById('mapPreview');
    preview.innerHTML = '';
    preview.appendChild(img);
  }
});

document.getElementById('generateBtn').onclick = async () => {
  const baseFile = document.getElementById('baseSkinInput').files[0];
  const mapFile = document.getElementById('mapInput').files[0];

  if (!mapFile) {
    alert("Please upload a map image!");
    return;
  }

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject("Image load error");
      img.src = URL.createObjectURL(file);
    });
  };

  const createBlankSkin = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    return canvas;
  };

  const resizeImage = (img, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  };

  const baseImg = baseFile ? resizeImage(await loadImage(baseFile), 64, 64) : createBlankSkin();
  const mapImg = resizeImage(await loadImage(mapFile), 72, 24);
  const mapCtx = mapImg.getContext('2d');

  const zip = new JSZip();

  for (let i = 0; i < 27; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseImg, 0, 0);

    const sx = (i % 9) * 8;
    const sy = Math.floor(i / 9) * 8;
    const face = mapCtx.getImageData(sx, sy, 8, 8);
    ctx.putImageData(face, 8, 8);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const name = `skin_${i + 1}.png`;
    zip.file(name, blob);
  }

  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'namemc_skinart.zip');
    document.getElementById('status').textContent = 'Skins generated successfully!';
  });
};
