const Discord = require('discord.js');
const map = new Map();
const ms = require('ms');

module.exports = {
  name: 'messageCreate',
  /**
   * 
   * @param {Bot} client 
   * @param {Discord.Message} message 
   */
  run: async (client, message) => {
    /*const config = {
      logsstatus: true,
      sanction: ["Derank"],
      spamCooldown: '3s' 
    };

    const channel = message.channel;
    if (!channel || !channel.guild || message.author.bot) return;

    let data = map.get(message.author.id) || { lastMessageTime: null };
    const now = Date.now();

    if (data.lastMessageTime && now - data.lastMessageTime < ms(config.spamCooldown)) {
      data.lastMessageTime = now;
      map.set(message.author.id, data);
      return;
    }

    data.lastMessageTime = now;
    map.set(message.author.id, data);

    try {
      if (config.logsstatus === true) {
        const logsChannel = message.guild.channels.cache.get("1216394496548278282");
        const description = '```diff\n' +
          `+ ${message.author.username} vient d'envoyer un message contenant un lien interdit.\n` +
          `Utilisateur: ${message.author.username} (ID: ${message.author.id})\n` +
          `Salon: ${message.channel?.name} (ID: ${message.channel?.id})\n` +
          `Punition: ${config.sanction || "Aucune"}\`\`\``;

        const embed = {
          description: description,
          color: 3092790
        }

        await logsChannel?.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
    }*/
  }
}
