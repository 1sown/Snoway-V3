const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'ping',
  aliases: ['latency', "latence"],
  description: 'Affiche la latence du bot et de l\'API de Discord.',
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
