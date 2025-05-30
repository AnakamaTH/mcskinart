document.getElementById('generateBtn').onclick = async () => {
  const baseFile = document.getElementById('baseSkinInput').files[0];
  const mapFile = document.getElementById('mapInput').files[0];

  if (!baseFile || !mapFile) {
    alert("Please upload both your base skin and a map image!");
    return;
  }

  const baseImg = await loadImage(baseFile);
  const mapImg = await loadImage(mapFile);

  const resizedMap = await resizeImage(mapImg, 72, 24);
  const zip = new JSZip();

  for (let i = 0; i < 27; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(baseImg, 0, 0);
    const sx = (i % 9) * 8;
    const sy = Math.floor(i / 9) * 8;
    const face = resizedMap.getContext('2d').getImageData(sx, sy, 8, 8);
    ctx.putImageData(face, 8, 8);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const name = i === 26 ? 'optional_skin.png' : `skin_${i + 1}.png`;
    zip.file(name, blob);
  }

  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'namemc_skinart.zip');
    document.getElementById('status').textContent = 'Skins generated successfully!';
  });
};

function loadImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
}

function resizeImage(img, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return Promise.resolve(canvas);
}
