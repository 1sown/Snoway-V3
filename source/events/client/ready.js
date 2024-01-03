const getNow = () => {
  return {
    time: new Date().toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };
};
const Snoway = require('../../structures/client/index');
const ligne = require('../../structures/Utils/ligne');
module.exports = {
  name: 'ready',
  /**
* 
* @param {Snoway} client 
* 
*/
  run: async (client) => {
    console.clear()
    const tag = client.user.tag;
    const id = client.user.id;
    const channel = client.channels.cache.size
    const userbot = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toLocaleString()
    console.log(`[BOT]      : ${tag} (${id}) est connecté à ${getNow().time}`);
    console.log(`[LIGNES]   : ${ligne.ligne().toLocaleString()}`);
    console.log(`[VERSION]  : ${client.version}`)
    console.log(`[COMMANDS] : ${client.commands.size}`)
    console.log(`[GUILDS]   : ${client.guilds.cache.size}`);
    console.log(`[CHANNELS] : ${channel}`);
    console.log(`[USERS]    : ${userbot}`);
    console.log('Snoway est prêt');
    console.log("-------------------------------");
    const restartChannelId = await client.db.get(`restartchannel`);
    if (restartChannelId) {
      const channel = client.channels.cache.get(restartChannelId);

      if (channel) {
        await channel.send(`Bot en ligne.`);
        await client.db.delete(`restartchannel`);
      }
    }

  },
};