const { Client } = require('ssh2');

const config = {
  host: '187.40.48.12',
  port: 22,
  username: 'test',
  password: 'test123'
};

function connectSSH(callback) {
  const conn = new Client();
  conn.on('ready', () => {
    conn.sftp((err, sftp) => {
      if (err) {
        return callback(err);
      }
      callback(null, sftp);
    });
  }).connect(config);

  conn.on('error', (err) => {
    console.error('Erro na conexão SSH:', err);
    callback(err);
  });

  return conn;
}

module.exports = { connectSSH };
