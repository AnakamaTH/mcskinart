document.getElementById('generateBtn').addEventListener('click', generateSkins);

async function generateSkins() {
  const baseInput = document.getElementById('baseSkinInput').files[0];
  const mapInput = document.getElementById('mapInput').files[0];
  const uuid = document.getElementById('uuidInput').value.trim();
  const status = document.getElementById('status');

  if (!baseInput || !mapInput) {
    status.textContent = "Please upload both the base skin and map image.";
    return;
  }

  status.textContent = "Generating skins...";

  const baseSkin = await loadImage(baseInput);
  const mapImage = await loadImage(mapInput);

  const zip = new JSZip();
  const tileSize = 8;
  const cols = 9, rows = 3;
  let slot = 27;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = tileCanvas.height = 8;
      const ctx = tileCanvas.getContext('2d');
      ctx.drawImage(mapImage, x * tileSize, y * tileSize, tileSize, tileSize, 0, 0, 8, 8);
      const tile = ctx.getImageData(0, 0, 8, 8);

      const skinCanvas = document.createElement('canvas');
      skinCanvas.width = 64;
      skinCanvas.height = 64;
      const skinCtx = skinCanvas.getContext('2d');
      skinCtx.drawImage(baseSkin, 0, 0);

      // Draw tile over base skin's head
      skinCtx.putImageData(tile, 8, 8); // head area on base skin

      const blob = await new Promise(resolve => skinCanvas.toBlob(resolve, 'image/png'));
      zip.file(`skin_${slot}.png`, blob);
      slot--;
    }
  }

  // Optional: preview skin
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = 64;
  previewCanvas.height = 64;
  const previewCtx = previewCanvas.getContext('2d');
  previewCtx.drawImage(baseSkin, 0, 0);
  previewCtx.drawImage(mapImage, 0, 0, 72, 24, 0, 0, 64, 24); // Preview bar on top

  const previewBlob = await new Promise(resolve => previewCanvas.toBlob(resolve, 'image/png'));
  zip.file(`optional_skin.png`, previewBlob);

  // Optionally save UUID in a file
  if (uuid) {
    zip.file(`uuid.txt`, uuid);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'NameMC_SkinArt.zip');
  status.textContent = "Done! SkinArt downloaded.";
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
