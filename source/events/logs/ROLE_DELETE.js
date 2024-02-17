const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    run: async (client, role) => {
        const color = await client.db.get(`color_${role.guild.id}`) || client.config.color;
        const logs = await client.db.get(`logs_${role.guild.id}`) || [];
        const salon = client.channels.cache.get(logs[0]?.roles);
        if (!salon) return;

        const embed = new EmbedBuilder()
            .setColor(color)
            .setFooter(client.footer)
            .setTitle('Suppression de Rôle')
            .setDescription(`Le rôle "${role.name}" a été supprimé.`);

        salon.send({ embeds: [embed] });
    }
};
