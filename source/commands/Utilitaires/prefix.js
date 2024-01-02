module.exports = {
  name: 'prefix',
  description: {
    fr:'Change le prefix du bot sur le serveur',
    en: "Change the prefix of the bot on the server"
  },
  usage: {
    fr:{"prefix <préfixe>": 'Change le prefix du bot sur le serveur'},
    en: {"prefix <prefix>": 'Change the prefix of the bot on the server'}
  },
  run: async (client, message, args) => {
    const newPrefix = args[0];
    const exPrefix = await client.db.get(`prefix_${message.guild.id}`)
    if (!newPrefix) {
      return message.channel.send("> `❌` Erreur : Veuillez précisez un `préfix`");
    }

    if(newPrefix === exPrefix) {
      return message.channel.send("> `❌` Erreur : Le préfixe donné est déjà celui du serveur.");

    }
    
    await client.db.set(`prefix_${message.guild.id}`, newPrefix)

    return message.channel.send(`🛠️ *Prefix modifié en :* \`${newPrefix}\``);
  },
};