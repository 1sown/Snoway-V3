const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'ping',
  aliases: ['latency', "latence"],
  description: {
    fr: "Affiche la latence du bot",
    en: "Displays bot latency"
  },
  /**
   * 
   * @param {Snoway} client 
   * @param {Snoway} message 
   * @param {Snoway} args 
   */
      run: async(client, message, args) => {
 
    message.channel.send({content: await client.lang('ping.ping') +` **${client.ws.ping}ms**` });
  }
}
