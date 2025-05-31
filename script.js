const generateBtn = document.getElementById("generateBtn");
const status = document.getElementById("status");

generateBtn.addEventListener("click", async () => {
  const baseSkinFile = document.getElementById("baseSkinInput").files[0];
  const mapFile = document.getElementById("mapInput").files[0];

  if (!baseSkinFile || !mapFile) {
    alert("Please upload both a base skin and a map image.");
    return;
  }

  status.textContent = "Processing...";

  const baseSkinImg = await loadImageFromFile(baseSkinFile);
  const mapImg = await loadImageFromFile(mapFile);
  const resizedMap = resizeImage(mapImg, 72, 24);

  const zip = new JSZip();
  let slot = 27;

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 9; x++) {
      const tile = cropImage(resizedMap, x * 8, y * 8, 8, 8);
      const newSkin = pasteHead(baseSkinImg, tile);
      const blob = await canvasToBlob(newSkin);
      zip.file(`skin_${slot}.png`, blob);
      slot--;
    }
  }

  // Optional skin preview
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = 64;
  previewCanvas.height = 64;
  const ctx = previewCanvas.getContext("2d");
  ctx.drawImage(baseSkinImg, 0, 0);
  ctx.drawImage(resizeImage(mapImg, 64, 24), 0, 0); // top overlay
  const previewBlob = await canvasToBlob(previewCanvas);
  zip.file("optional_skin.png", previewBlob);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "NameMC_SkinArt.zip");

  status.textContent = "Done! ZIP downloaded.";
});

function loadImageFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function resizeImage(img, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function cropImage(canvas, x, y, w, h) {
