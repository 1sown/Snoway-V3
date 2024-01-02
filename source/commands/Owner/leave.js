const Snoway = require("../../structures/client");

module.exports = {
    name: 'leave',
    description: {
        fr: "Permet de faire leave le bot d\'un discord ou il est !",
        en: "Allows you to leave the bot from a discord where it is!"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Snoway} message 
     * @param {Snoway} args 
     * @returns 
     */
    run: async (client, message, args) => {

        const guildId = args[0];
        const leaveg = client.guilds.cache.get(guildId);

        if (!leaveg || leaveg.id === client.functions.config.private) {
            return message.reply({ content: "Je n'ai pas pu trouver la guilde spécifiée ou actuelle." });
        }

        await message.reply({ content: `Voulez-vous vraiment que je quitte le serveur : **${leaveg.name}**, répondre par \`oui\` ou \`non\` ?` });

        const filter = response => {
            return response.author.id === message.author.id;
        };

        try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
            const response = collected.first();

            if (response.content.toLowerCase() === 'oui') {
                message.reply({ content: `J'ai bien quitté le serveur **${leaveg.name}**` }).catch(() => {})
                await leaveg.leave();
            } else {
                message.reply({ content: "Annulation." });
            }
        } catch (error) {
            console.error(error);
            message.reply({ content: "Opération annulée." });
        }
    }
};
