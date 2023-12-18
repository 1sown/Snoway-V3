const Snoway = require('./source/structures/client/index')
const client = new Snoway() 
process.on('uncaughtException', (error) => {
  console.error('Erreur:', error);
});

module.exports = client
