const Discord = require('discord.js');

module.exports = {
    name: 'setpic',
    aliases: ["setavatar", "avatar"],
    usage: {
        "setpic <image/lien>": "Définir l\'avatar du bot."
    }, 
    description: 'Définir l\'avatar du bot.',
    run: async (client, message, args, commandName) => {
        let avatarURL;

        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            avatarURL = attachment.url;
        } else if (args[0]) {
            avatarURL = args[0];
        } else {
            return message.channel.send("Une erreur vient de se produire...");
        }

        try {
            await client.user.setAvatar(avatarURL);
            return message.channel.send("[J'ai bien changé ma photo de profil]" + `(${avatarURL})`);
        } catch (error) {
            console.error('Erreur:', error);
            return message.channel.send("Une erreur vient de se produire...");
        }
    },
};
