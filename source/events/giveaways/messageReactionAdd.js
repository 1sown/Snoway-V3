const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageReactionAdd',
    run: async (client, reaction, user) => {
        const color = await client.db.get(`color_${reaction.message.guildId}`) || client.config.color;
        const db = await client.db.get(`giveaways_${reaction.message.guildId}`) || []
        
    }
};
