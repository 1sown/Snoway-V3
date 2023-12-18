const Discord = require('discord.js');
const Snoway = require('../../structures/client');

module.exports = {
    name: "update",
    description: "Redémarre le bot.",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {
        if (!client.dev.includes(message.author.id)) return;

        message.channel.send({ content: 'Redémarrage...' }).then(async () => {
            await client.db.set(`restartchannel`, message.channel.id);
            process.exit(1)
        })
    }
};
