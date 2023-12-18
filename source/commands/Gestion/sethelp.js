const { MessageActionRow, MessageSelectMenuBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'sethelp',
    description: 'Configurer le type de help affiché.',
    run: async (client, message, args) => {
        const options = [
            { label: 'Onepage', value: 'onepage' },
            { label: 'Boutons', value: 'normal' },
        ];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Sélectionnez le type de help')
            .addOptions(options);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle('SetHelp')
            .setDescription('Sélectionnez le type de help que vous souhaitez utiliser.');

        const messageOptions = {
            content: null,
            embeds: [embed],
            components: [row]
        };

        const helpMessage = await message.channel.send(messageOptions);

        const filter = i => i.customId === 'select';
        const collector = helpMessage.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "Vous n'êtes pas autorisé à interagir avec cette interaction !", ephemeral: true });
            }

            const selectedValue = i.values[0];
            await client.db.set("module-help", selectedValue)
            await i.update({ content: "Type de help modifié.", components: [], embeds: [] });
        });
    }
};
