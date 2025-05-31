const backgrounds = [
  'https://pa1.aminoapps.com/5845/5749d2581b8ff83d442fbee9935fcbc5f0715067_hq.gif',
  'https://pa1.aminoapps.com/5845/9cb2168430d3538abdda1ce6676bf3c37f517369_hq.gif',
  'https://pa1.aminoapps.com/5845/d6890eeb58a89ef075cdfbe7b940b231bec61a49_hq.gif',
  'https://pa1.aminoapps.com/5845/32c70e035bc4ac6802178e43be9066e445095bed_hq.gif',
  'https://pm1.aminoapps.com/5845/992626a4a240f99676166c0404c980cc69736c21_hq.jpg'
];

document.body.style.backgroundImage = `url('${backgrounds[Math.floor(Math.random() * backgrounds.length)]}')`;

document.getElementById('mapInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    document.getElementById('mapPreview').src = url;
  }
});

document.getElementById('generateBtn').onclick = async () => {
  const baseFile = document.getElementById('baseSkinInput').files[0];
  const mapFile = document.getElementById('mapInput').files[0];
  const statusEl = document.getElementById('status');

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
    zip.file(`skin_${i + 1}.png`, blob);
  }

  zip.generateAsync({ type: 'blob' }).then(content => {
    saveAs(content, 'namemc_skinart.zip');
    statusEl.textContent = 'Skins generated successfully!';
    statusEl.className = 'success';
  });
};
