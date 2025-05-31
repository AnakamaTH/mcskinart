<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NameMC SkinArt Generator</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Outfit', sans-serif;
      background: linear-gradient(to bottom, #111, #222);
      color: #fff;
      text-align: center;
      padding: 2em;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 0.5em;
    }
    input[type="file"], button {
      margin: 1em;
      padding: 0.75em 1.5em;
      font-size: 1em;
      border: none;
      border-radius: 8px;
    }
    button {
      background-color: #00bcd4;
      color: white;
      cursor: pointer;
      transition: background 0.3s;
    }
    button:hover {
      background-color: #0097a7;
    }
    #status {
      margin-top: 1em;
      font-size: 1.1em;
      color: #90ee90;
    }
    footer {
      margin-top: 3em;
      color: #aaa;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>NameMC SkinArt Generator</h1>
  <p>Generate 27 Minecraft skins from a face map and base skin.</p>

  <input type="file" id="baseSkinInput" accept="image/png">
  <br>
  <input type="file" id="mapInput" accept="image/png">
  <br>
  <button id="generateBtn">Generate Skins</button>
  <p id="status"></p>

  <footer>
    Not affiliated with NameMC.
  </footer>

  <!-- JSZip & FileSaver -->
  <script src="https://cdn.jsdelivr.net/npm/jszip"></script>
  <script src="https://cdn.jsdelivr.net/npm/file-saver"></script>

  <!-- Generator Script -->
  <script>
    document.getElementById('generateBtn').onclick = async () => {
      const baseFile = document.getElementById('baseSkinInput').files[0];
      const mapFile = document.getElementById('mapInput').files[0];
      const status = document.getElementById('status');
      status.textContent = '';

      if (!mapFile) {
        alert("Please upload a 72×24 map image!");
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

      try {
        const baseImg = baseFile
          ? resizeImage(await loadImage(baseFile), 64, 64)
          : createBlankSkin();

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

          const name = i === 26 ? 'optional_skin.png' : `skin_${i + 1}.png`;
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          zip.file(name, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'namemc_skinart.zip');
        status.textContent = 'Skins generated successfully!';
      } catch (err) {
        status.textContent = ' Error: ' + err;
      }
    };
  </script>
</body>
</html>
