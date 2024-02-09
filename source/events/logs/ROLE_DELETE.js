const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roleDelete',
    run: async (client, role) => {
        const color = await client.db.get(`color_${role.guild.id}`) || client.config.color;
        const logs = await client.db.get(`logs_${role.guild.id}`) || [];
        const salon = client.channels.cache.get(logs[0]?.roles);
        if (!salon) return;
        console.log(role)
        const embed = new EmbedBuilder()
            .setColor(color)
            .setFooter(client.footer)
            .setTitle('Suppression de Rôle')
            .addFields({name: "Nom", value: `\`\`\`js\n${role.name}\`\`\``, inline: true})
            .addFields({name:"ID", value: `\`\`\`js\n${role.id}\`\`\``, inline: true})
            .addFields({name:"Couleur", value: `\`\`\`js\n${role.color === 0 ? "Aucune" : role.hexColor}\`\`\``, inline: true})

        salon.send({ embeds: [embed] });
    }
};
