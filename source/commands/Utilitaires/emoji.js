const Snoway = require("../../structures/client");
const Discord = require('discord.js');

module.exports = {
    name: 'create',
    description: 'Permet de copier un emoji pour l\'ajouter au serveur',
    aliases: ["emoji"],
    usage: {
        "emoji <1-50 émojis>": "Permet de copier un ou plusieurs emoji(s) pour les ajouter au serveur"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message 
     * @param {string[]} args 
     * @returns 
     */
    run: async (client, message, args) => {
        const emojiRegex = /<a?:[a-zA-Z0-9_]+:(\d+)>/;
        const totalEmojis = args.length;
        let creeemojis = 0;
        for (const rawEmoji of args) {
            const emojiss = rawEmoji.match(emojiRegex);

            if (emojiss) {
                const emojiId = emojiss[1];
                const extension = rawEmoji.startsWith("<a:") ? ".gif" : ".png";
                const url = `https://cdn.discordapp.com/emojis/${emojiId + extension}`;

                message.guild.emojis.create({ attachment: url, name: emojiId })
                    .then((emoji) => {
                        creeemojis++;
                        if (creeemojis === totalEmojis) {
                            message.channel.send(`${creeemojis} émoji${creeemojis !== 1 ? "s" : ""} ont été créé${creeemojis !== 1 ? "s" : ""}`);
                        }
                    })
                    .catch((error) => {
                        console.error(error)
                        message.channel.send({ content: "Une erreur s'est produite" });
                    });
            }
        }
    },
};
