const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: "pstats",
    description: "Affiche le nombre de prevname",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {
        if (!client.dev.includes(message.author.id)) return;

        try {
            const response = await client.api.prevcount();
            const count = response.num;
            message.channel.send({ content: `J'ai \`${count.toString()}\` prevname !` })

        } catch (error) {
            console.error('Erreur:', error);
            message.reply('Une erreur s\'est produite.');
        }
    }
};
