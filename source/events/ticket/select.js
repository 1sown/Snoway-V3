const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const Valory = require('../../structures/client');
const Discord = require('discord.js');

module.exports = {
    name: "interactionCreate",
    /**
     * @param {Valory} client
     * @param {Valory} interaction
     */
    run: async (client, interaction) => {
        try {
            if (!interaction.isStringSelectMenu()) return;

            if (interaction.customId === 'ticket') {
                const color = await client.db.get(`color_${interaction.guild.id}`) || client.config.default_color
                const ticketmessage = await interaction.channel.messages.fetch(interaction.message.id);
                await interaction.deferReply({ ephemeral: true })
                const id = interaction.values[0].split('_')[1];
                const db = await client?.db.get(`ticket_${interaction.guild.id}`);
                if (!db) return;

                const option = db.option.find(option => option.value === id);
                if (!option) return;

                const options = [];
                const regex = /<:(.*):(\d+)>/;

                db.option.forEach(option => {
                    if (option.emoji) {
                        const match = option.emoji.match(regex);
                        if (match) {
                            const emojiId = match[2];
                            const emoji = client.emojis.cache.get(emojiId);
                            if (emoji) {
                                options.push({
                                    label: option.text,
                                    emoji: emojiId,
                                    description: option.description,
                                    value: `ticket_${option.value}`
                                });
                            }
                        }
                    } else {
                        options.push({
                            label: option.text,
                            description: option.description,
                            value: 'ticket_' + option.value
                        });
                    }
                });
                if (ticketmessage) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('ticket')
                                .addOptions(options)
                        );
                    await ticketmessage.edit({ components: [row] });
                }

                const tickeruser = await client.db.get(`ticket_user_${interaction.guild.id}`) || [];
                const resul = tickeruser.find(ticket => ticket.author === interaction.user.id);
                
                if (resul && tickeruser.length >= db?.maxticket) {
                    return await interaction.editReply({ content: `Vous avez déjà atteint le nombre maximal de tickets ouverts !`, ephemeral: true });
                }

                let permissionOverwrites = [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [Discord.PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user,
                        allow: [
                            Discord.PermissionFlagsBits.SendMessages,
                            Discord.PermissionFlagsBits.ViewChannel,
                            Discord.PermissionFlagsBits.AttachFiles,
                            Discord.PermissionFlagsBits.AddReactions
                        ]
                    }
                ];

                if (option.acess) {
                    const permissionObject = {
                        id: option.acess,
                        allow: [
                            Discord.PermissionFlagsBits.SendMessages,
                            Discord.PermissionFlagsBits.ViewChannel,
                            Discord.PermissionFlagsBits.AttachFiles,
                            Discord.PermissionFlagsBits.AddReactions
                        ]
                    };
                    permissionOverwrites.push(permissionObject);
                }


                const channel = await interaction.guild.channels.create({
                    parent: client.channels.cache.get(option.categorie) ? option.categorie : null,
                    name: option.text + '-' + interaction.user.username,
                    type: 0,
                    permissionOverwrites: permissionOverwrites,
                });

                await interaction.editReply({ content: `Ticket open <#${channel?.id}>` });
                const embed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setFooter(client.footer)
                    .setDescription(option.message)
                    .setTitle('Ticket ouvert par ' + interaction.user.username)

                const idunique = code(15)
                const button = new ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setLabel('Fermer le ticket')
                        .setStyle(4)
                        .setEmoji('🔒')
                        .setCustomId("close_" + idunique)
                )

                if (db.claimbutton) {
                    button.addComponents(
                        new Discord.ButtonBuilder()
                            .setLabel('Récupère le ticket')
                            .setStyle(2)
                            .setEmoji('🔐')
                            .setCustomId("claim_" + idunique)
                    )
                }
                channel.send({
                    embeds: [embed],
                    content: option.mention ? `<@&${option.mention}>` : null,
                    components: [button]
                })
                tickeruser.push({
                    salon: channel.id,
                    author: interaction.user.id,
                    date: Date.now(),
                    id: idunique,
                    option: option.value,
                    claim: null,
                })
                await client.db.set(`ticket_user_${interaction.guild.id}`, tickeruser)
            }
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: 'Une erreur est survenue.', flags: 64 });
        }
    }
};


function code(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}