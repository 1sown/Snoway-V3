const Discord = require('discord.js');
const Valory = require('../../structures/client/index');

module.exports = {
    name: "name",
    description: "Permet de changer le nom du bot",
    usage: "name <nom>",
    run: async (client, message, args) => {
        let name = args.join(" ");

        if (!name) return;
        if (name.length > 32) return message.channel.send("Le nom est trop long.");
        if (name.length < 2) return message.channel.send("Le nom est trop court.");

        client.user.setUsername(name);
        message.channel.send("J'ai bien changé mon nom en : " + `${name}`);
    }
};
