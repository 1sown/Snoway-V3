const Snoway = require("../../structures/client/index");
const Discord = require('discord.js')
const Snipe = new Map();

module.exports = {
    name: "messageDelete",
    /**
     * @param {Snoway} client
     * @param {Discord.Message} message
     */
    run: async (client, message) => {
        if (!message.guild || message.author?.bot) return;
        const channelId = message.channel.id;

        if (!Snipe.has(channelId)) {
            Snipe.set(channelId, []);
        }

        Snipe.get(channelId).unshift({
            content: message.content,
            author: message.author,
            timestamp: Date.now(),
        });
    }
};
