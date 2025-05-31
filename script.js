<form id="skinForm">
  <input type="file" id="baseSkinInput" accept="image/png" />
  <input type="file" id="mapInput" accept="image/png" />
  <button type="button" id="generateBtn">Generate</button>
</form>

<img id="mapPreview" style="display:none; width:144px; height:48px; object-fit: contain; border: 2px solid #fff; margin-top: 1rem;" />

<div id="status" style="margin-top: 1rem; font-weight: bold;"></div>

<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.0/dist/jszip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>

<script>
  // GIF backgrounds array
  const gifs = [
    "https://pa1.aminoapps.com/5845/5749d2581b8ff83d442fbee9935fcbc5f0715067_hq.gif",
    "https://pa1.aminoapps.com/5845/9cb2168430d3538abdda1ce6676bf3c37f517369_hq.gif",
    "https://pa1.aminoapps.com/5845/d6890eeb58a89ef075cdfbe7b940b231bec61a49_hq.gif",
    "https://pa1.aminoapps.com/5845/32c70e035bc4ac6802178e43be9066e445095bed_hq.gif",
    "https://i.pinimg.com/originals/e5/a1/7e/e5a17eb79c5472b5fea8ab36282f3696.gif",
    "https://pa1.aminoapps.com/5845/aa86445c253d52c324bfa0ce378bb049253e7f01_hq.gif",
    "https://pa1.aminoapps.com/5845/3e279f21d4b8e146c8076013eb93613d441d1c4b_hq.gif",
    "https://i.pinimg.com/originals/99/f4/36/99f43636e89075b308a720bff365b132.gif",
    "https://i.redd.it/r152bcq4zhv51.gif",
    "https://i.gifer.com/1toU.gif"
  ];

  // Set random background GIF on page load
  document.querySelector(".overlay").style.backgroundImage = `url('${gifs[Math.floor(Math.random() * gifs.length)]}')`;

  // Clear file inputs on page load & before unload
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skinForm').reset();
  });
  window.addEventListener('beforeunload', () => {
    document.getElementById('skinForm').reset();
  });

  // Show preview when map file selected
  document.getElementById('mapInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const preview = document.getElementById('mapPreview');
      preview.src = url;
      preview.style.display = 'block';
    }
  });

  // Generate button logic
  document.getElementById('generateBtn').onclick = async () => {
    const baseFile = document.getElementById('baseSkinInput').files[0];
    const mapFile = document.getElementById('mapInput').files[0];
    const status = document.getElementById('status');
    status.textContent = '';
    status.classList.remove('success');

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

    const resizeImage = (img, width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      return canvas;
    };

    const baseImg = baseFile ? resizeImage(await loadImage(baseFile), 64, 64) : (() => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      return canvas;
    })();

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
      status.textContent = 'Skins generated successfully!';
      status.classList.add('success');
      status.style.color = 'green';  // Make success message green
    });
  };
</script>

<style>
  .success {
    font-weight: bold;
  }
  /* your other styles */
</style>
