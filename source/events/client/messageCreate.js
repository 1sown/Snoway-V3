const Discord = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
  name: 'messageCreate',
  /**
   * 
   * @param {Snoway} client 
   * @param {Discord.Message} message 
   * @returns 
   */
  run: async (client, message) => {
    if (!message.guild || message.author.bot) return;
    const prefix = await client.db.get(`prefix_${message.guild.id}`) || client.config.prefix
    client.color = await client.db.get(`color_${message.guild.id}`) || client.config.color
    client.prefix = await client.db.get(`prefix_${message.guild.id}`) || client.config.prefix


    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
      return message.channel.send(`Mon prefix sur ce serveur est: \`${prefix}\``).catch(() => { });
    }

    if (!message.content.startsWith(prefix) || message.content === prefix || message.content.startsWith(prefix + ' ')) {
      if (!message.content.startsWith(`<@${client.user.id}>`) && !message.content.startsWith(`<@!${client.user.id}>`)) {
        return;
      }
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [, matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);

    const commandName = args.shift()?.toLowerCase().normalize();
    if (!commandName) return;

    const cmd = client.commands.get(commandName) || client.aliases.get(commandName);
    if (!cmd) return;
    const owner = await client.db.get(`owner`) || []
    if (!client.config.buyers.includes(message.author.id)) {
      if (!owner.includes(message.author.id)) {
        return message.reply("Tu n'as pas les permissions nécessaires pour faire cette commande !");
      }
    }


    cmd.run(client, message, args, commandName);
  }
}
