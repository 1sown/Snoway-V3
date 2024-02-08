const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, Message, ButtonBuilder } = require('discord.js');
const Snoway = require('../../structures/client/index')
module.exports = {
    name: 'embed',
    aliases: ["createembed", "embedbuilder", "builder"],
    description: {
        fr: "Permet de créer un embed personnalisé",
        en: "Create a custom embed"
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Message} message 
     * @param {string[]} args 
     */
    run: async (client, message, args) => {
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription('** **');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('options')
                    .addOptions([
                        {
                            label: 'Modifier le titre',
                            emoji: "✏",
                            value: 'titre',
                        },
                        {
                            label: 'Modifier la description',
                            emoji: "💭",
                            value: 'description',
                        },
                        {
                            label: 'Modifier la couleur',
                            emoji: "⚫",
                            value: 'color',
                        },
                        {
                            label: 'Modifier l\'image',
                            emoji: "🖼",
                            value: 'image',
                        },
                        {
                            label: 'Modifier le thumbnail',
                            emoji: "🗺",
                            value: 'thumbnail',
                        },
                        {
                            label: 'Modifier l\'auteur',
                            emoji: "✂",
                            value: 'auteur',
                        },
                        {
                            label: 'Modifier le footer',
                            emoji: "🔻",
                            value: 'footer',
                        },
                        {
                            label: 'Copier un embed',
                            emoji: "💉",
                            value: 'copy',
                        },
                    ]),
            );

        const rowButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('yep')
                .setDisabled(false)
                .setStyle(2)
                .setLabel('✅ Valider'),
                new ButtonBuilder()
                .setCustomId('nop')
                .setDisabled(false)
                .setStyle(4)
                .setLabel('❌ Annuler'),
            )
        const msg = await message.channel.send({ content: `**Panel de création d'embeds de ${message.guild.name}**`, embeds: [embed], components: [row, rowButton] });

        const collector = msg.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.customId === 'options') {
                await i.deferUpdate();
                const option = i.values[0];
                let response;
                switch (option) {
                    case 'color':
                        const reply = await msg.reply('Merci de me donner la nouvelle couleur des embeds');

                        const responseCollector = message.channel.createMessageCollector();

                        responseCollector.on('collect', async m => {
                            const color = m.content.trim();
                            if (await client.functions.bot.color(color)) {
                                embed.setColor(await client.functions.bot.color(color));
                                await msg.edit({ embeds: [embed] });
                            } else {
                                await message.channel.send('Couleur invalide. Assurez-vous que la couleur est en format hexadécimal (ex: #ff0000).');
                            }

                            await m.delete().catch(() => { });
                            await reply.delete().catch(() => { });
                            responseCollector.stop();
                        });
                        break;

                    case 'field':
                        response = 'Entrez le titre et la valeur du champ séparés par un caractère pipe (|) :';
                        break;
                    case 'description':
                        response = 'Entrez la nouvelle description de l\'embed :';
                        break;
                    default:
                        response = 'Option invalide.';
                        break;
                }
            }
        });
    },
};
