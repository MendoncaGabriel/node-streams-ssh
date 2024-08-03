const fs = require('fs');
const path = require('path');

// Define o tamanho do chunk em megabytes
const chunkSizeMB = 4; // 4MB

exports.stream = (req, res) => {
  const fileName = req.params.fileName;
  const videoPath = path.resolve('storage', fileName);

  fs.stat(videoPath, (err, stat) => {
    if (err) {
      res.status(404).send('Video not found');
      return;
    }

    const fileSize = stat.size;
    const range = req.headers.range;

    // Calcula o tamanho do chunk em bytes
    const chunkSizeBytes = chunkSizeMB * 1024 * 1024;

    if (range) {
      // Se houver um cabeçalho de intervalo, trata o range de bytes solicitado
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      // Define o final do intervalo, garantindo que não exceda o tamanho do arquivo
      const end = Math.min(start + chunkSizeBytes - 1, fileSize - 1);

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": (end - start + 1),
        "Content-Type": "video/mp4"
      });

      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.on('error', (error) => {
        res.status(500).send('Error reading video');
      });
      videoStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4" 
      });

      const videoStream = fs.createReadStream(videoPath);
      videoStream.on('error', (error) => {
        res.status(500).send('Error reading video');
      });
      videoStream.pipe(res);
    }
  });
};
