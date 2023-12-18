const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'fivem',
  description: 'Connecte votre serveur FiveM.',
  /**
   * 
   * @param {Snoway} client 
   * @param {Message} message 
   * @param {string[]} args 
   */
  run: async (client, message, args) => {
    if (args[0]) {
      if (args[0].toLowerCase() === "set") {
        const ips = args[1];
        const { ip, port } = check(ips);
        console.log(ip, port);

        if (ip && port) {
          console.log(`Adresse IP: ${ip}, Port: ${port}`);
        } else {
          message.reply('Veuillez spécifier une adresse IP et un port valides.');
        }
      } else {
       embed(client)
      }
    } else {
      message.channel.send("J'aime les enfants");
    }
  }
}

function check(ip) {
  const words = ip.split(" ");
  for (const word of words) {
    if (word.includes(":")) {
      const [ip, port] = word.split(":");
      return { ip, port };
    }
  }
  return { ip: null, port: null };
}

async function embed(client) {
  const embed = new EmbedBuilder()
  .setColor(client.color)
  .setFooter(client.footer)
  .set
}