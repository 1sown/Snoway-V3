const Snoway = require('../../structures/client/index');
const Discord = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'Permet de faire quitter le bot sur un serveur.',
    usage: {
        "leave <ID>": "Permet de faire quitter le bot sur un serveur."
    },
    /**
   * 
   * @param {Snoway} client 
   * @param {Discord.Message} message 
   * @param {Snoway} args 
   * @returns 
   */
    run: async (client, message, args) => {

        const guildId = args[0] || message.guild.id;


        const guild = client.guilds.cache.get(guildId);

        if (!guild) {
            return message.reply("> `❌` Le serveur est introuvable dans ma base de données");
        }

        try {
            message.reply((guildId === message.guild.id) ? '> Je quitte le serveur.' : `> Je quitte le serveur **${guild.name}**`);
            await guild.leave();
        } catch (error) {
            console.error(`Erreur:`, error);
            message.reply("Une erreur est survenue.");
        }
    },
};
