const Discord = require('discord.js');
const Snoway = require('../../structures/client/index');

module.exports = {
    name: "name",
    description: "Permet de changer le nom du bot",
    usage: {
        "name <new_name>": "Permet de changer le nom du bot"
    },
    run: async (client, message, args) => {
        let name = args.join(" ");

        if (!name) return;
        if (name.length > 32) return message.channel.send("Le nom est trop long.");
        if (name.length < 2) return message.channel.send("Le nom est trop court.");

        client.user.setUsername(name);
        message.channel.send("J'ai bien changé mon nom en : " + `${name}`);
    }
};
