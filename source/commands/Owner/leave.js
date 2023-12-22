module.exports = {
    name: 'leave',
    description: 'Permet de faire leave le bot d\'un discord ou il est !',
    run: async (client, message, args, commandName) => {

        const guildId = args[0];
        const leaveg = client.guilds.cache.get(guildId);

        if (!leaveg) {
            return message.reply({ content: "Je n'ai pas pu trouver la guilde spécifiée ou actuelle." });
        }

        await message.reply({ content: `Voulez-vous vraiment que je quitte le serveur : **${leaveg.name}**, répondre par oui ou non ?` });

        const filter = response => {
            return response.author.id === message.author.id;
        };

        try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] });
            const response = collected.first();

            if (response.content.toLowerCase() === 'oui') {
                await leaveg.leave();
                message.reply({ content: `J'ai bien quitté le serveur **${leaveg.name}**` });
            } else {
                message.reply({ content: "Annulation." });
            }
        } catch (error) {
            console.error(error);
            message.reply({ content: " Opération annulée." });
        }
    }
};
