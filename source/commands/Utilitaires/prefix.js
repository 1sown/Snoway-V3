module.exports = {
  name: 'prefix',
  description: 'Change le prefix du bot sur le serveur',
  usage: {
    "prefix <préfixe>": 'Change le prefix du bot sur le serveur'
  },
  run: async (client, message, args) => {
    const newPrefix = args[0];
    if (!newPrefix) {
      return message.channel.send("> `❌` Erreur : Veuillez précisez un `préfix`");
    }
    client.db.set(`prefix_${message.guild.id}`, newPrefix)

    return message.channel.send(`🛠️ *Prefix modifié en :* \`${newPrefix}\``);
  },
};