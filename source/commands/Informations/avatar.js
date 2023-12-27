const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'avatar',
  aliases: ['pic', "pp"],
  description: 'Affiche la latence du bot et de l\'API de Discord.',
  /**
   * 
   * @param {Snoway} client 
   * @param {Snoway} message 
   * @param {Snoway} args 
   */
  run: async (client, message, args) => {
    const user = message.mentions.members.first() || client.users.cache.get(args[0]) || message.author;


    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({ name: user?.username })
      .setImage(user.avatarURL({ dynamic: true, size: 4096 }))
      .setFooter(client.footer)

    return message.channel.send({
      embeds: [embed]
    })
  }
}
