const { connectSSH } = require('../ssh/ssh'); 

exports.stream = (req, res) => {
  const chunkSizeMB = 4; // 4MB
  const folder = req.params.folder;
  const fileName = req.params.fileName;

  connectSSH((err, sftp) => {
    if (err) {
      return res.status(500).send('Erro ao conectar ao SFTP.');
    }

    const remoteFilePath = `C:/Users/test/${folder}/${fileName}`;

    sftp.stat(remoteFilePath, (err, stats) => {
      if (err) {
        sftp.end();
        return res.status(500).send('Erro ao obter informações do arquivo.');
      }

      const fileSize = stats.size;
      const range = req.headers.range;
      const chunkSizeBytes = chunkSizeMB * 1024 * 1024;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = Math.min(start + chunkSizeBytes - 1, fileSize - 1);

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": (end - start + 1),
          "Content-Type": "video/mp4"
        });

        const readStream = sftp.createReadStream(remoteFilePath, { start, end });
        readStream.on('error', (error) => {
          console.error('Erro ao ler o arquivo remoto:', error);
          res.status(500).send('Erro ao ler o arquivo remoto.');
        });
        readStream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4"
        });

        const readStream = sftp.createReadStream(remoteFilePath);
        readStream.on('error', (error) => {
          console.error('Erro ao ler o arquivo remoto:', error);
          res.status(500).send('Erro ao ler o arquivo remoto.');
        });
        readStream.pipe(res);
      }
    });

    sftp.on('end', () => {
      console.log('Conexão SFTP encerrada.');
    });
  });
};
