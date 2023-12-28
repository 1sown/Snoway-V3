const { EmbedBuilder } = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'avatar',
  aliases: ['pic', "pp"],
  description: 'Permet de voir la photo de profil d\'un utilisateur',
  usage: {
    "pic [mention/id]": "Permet de voir la photo de profil d'un utilisateur."
  },
  /**
   * 
   * @param {Snoway} client 
   * @param {Snoway} message 
   * @param {Snoway} args 
   */
  run: async (client, message, args) => {
    let target = null;

    const menuser = message.mentions.members.first();
    const idmember = message.guild.members.cache.get(args[0]);

    if (menuser) {
      target = menuser.user;
    } else if (idmember) {
      target = idmember.user;
    } else {
      try {
        target = await client.users.fetch(args[0]);
      } catch (error) {
        console.error('Erreur:', error);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({ name: `${target?.username}` })
      .setImage(`https://cdn.discordapp.com/avatars/${target.id}/${target.avatar}.webp?size=4096`)
      .setFooter(client.footer)

    return message.channel.send({
      embeds: [embed]
    })
  }
}