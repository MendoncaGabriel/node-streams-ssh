const { Client } = require('ssh2');
const path = require('path');

// Define o tamanho do chunk em megabytes
const chunkSizeMB = 4; // 4MB

const sshConfig = {
  host: '192.168.100.10',
  port: 22,
  username: 'SEU_USUARIO',
  privateKey: require('fs').readFileSync('/caminho/para/sua/chave_privada') // ou password: 'SUA_SENHA'
};

exports.stream = (req, res) => {
  const fileName = req.params.fileName;
  const remoteFilePath = `/caminho/para/storage/${fileName}`;
  const conn = new Client();

  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) throw err;

      sftp.stat(remoteFilePath, (err, stat) => {
        if (err) {
          res.status(404).send('Video not found');
          conn.end();
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

          const videoStream = sftp.createReadStream(remoteFilePath, { start, end });
          videoStream.on('error', (error) => {
            res.status(500).send('Error reading video');
          });
          videoStream.pipe(res);
        } else {
          res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4" 
          });

          const videoStream = sftp.createReadStream(remoteFilePath);
          videoStream.on('error', (error) => {
            res.status(500).send('Error reading video');
          });
          videoStream.pipe(res);
        }
      });
    });
  }).connect(sshConfig);
};
