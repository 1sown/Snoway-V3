const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');

module.exports = {
    name: "refreshconfig",
    description: "Rafraîchit la configuration du bot.",
    /**
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async (client, message, args) => {
        if (!client.dev.includes(message.author.id)) return;
        try {
            client.functions.bot.refreshConfig();
            message.channel.send({ content: 'Fichier config rechargé.' });
        } catch (error) {
            console.error('Erreur :', error);
            message.channel.send({ content: "Erreur." });
        }
    }
};
