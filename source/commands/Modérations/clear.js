const Snoway = require("../../structures/client");

module.exports = {
    name: "clear",
    description: "Clear le nombre de messages dans le salon ou d'un utilisateur entre 1 et 100",
    usage: {
        "clear <nombre>": "Permet de supprimer d'un coup plusieurs messages dans un salon",
        "clear <@/ID> <nombre>": "Permet de supprimer un nombre de message en ciblant un membre"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Snoway} message 
     * @param {Snoway} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const amount = parseInt(args[args.length - 1]);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply(`Utilisation correcte : \`${client.prefix}clear [User] <amount>\``);
        }


        try {
            if (message.mentions.users.size > 0) {
                const targetUser = message.mentions.users.first();
                const fetched = await message.channel.messages.fetch({
                    limit: amount,
                    before: message.id,
                });

                const messagesToDelete = fetched.filter(msg => msg.author.id === targetUser.id);

                await message.channel.bulkDelete(messagesToDelete, true);

                const deletedCount = messagesToDelete.size;
                message.channel.send({ content: `Je viens de supprimer \`${deletedCount}\` messages de \`${targetUser.tag}\` !` });
            } else {
                const fetched = await message.channel.messages.fetch({ limit: amount });
                await message.channel.bulkDelete(fetched, true);

                const deletedCount = fetched.size;
                message.channel.send({ content: `Je viens de supprimer \`${deletedCount}\` messages dans le salon !` });
            }
        } catch (err) {
            console.error('Erreur:', err);
            message.reply("Une erreur vient de se produire...");
        }
    }
};
