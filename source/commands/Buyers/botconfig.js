const Discord = require('discord.js');
const Snoway = require('../../structures/client/index.js');
const { sleep } = require('../../structures/Functions/sleep');
module.exports = {
    name: "botconfig",
    description: {
        fr: "Gérer le profil du bot",
        en: "Manage bot profile"
    },
    /**
     * @param {Snoway} client
     * @param {Discord.Message} message
     * @param {Array} args
     */
    run: async (client, message, args) => {
        if (!client.config.buyers.includes(message.author.id)) return;
        
        return message.reply('Non Disponible.') 
        const msg = await message.channel.send({
            content: "Récupération des informations du bot"
        })


        async function embed() {
            const botinfo = await client.functions.discord.getProile()
            console.log(botinfo)
            const embed = new Discord.EmbedBuilder()
                .setTitle('Modification du bot ' + botinfo.bot.username)
                .setColor(client.color)
                .setFooter(client.footer)
                .setDescription(
                    `**Nom du bot:** \`\`\`js\n${botinfo.bot.username}\`\`\`\n` +
                    `**Description de l'application:** \`\`\`js\n${botinfo.description}\`\`\`\n`
                )

            const buttons = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.StringSelectMenuBuilder()
                        .setCustomId('profileOptions')
                        .setPlaceholder('Sélectionnez une option')
                        .addOptions([
                            {
                                label: 'Nom',
                                value: 'name',
                            },
                            {
                                label: 'Bio',
                                value: 'bio',
                            },

                        ]),
                );

            await msg.edit({
                embeds: [embed],
                content: null,
                components: [buttons]
            })
        }

        embed()

        const collector = msg.createMessageComponentCollector()

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: await client.lang('interaction'),
                    flags: 64
                });
            }
            const selectedOption = i.values[0];
            if (selectedOption === 'name') {

               await client.functions.discord.ModifBot("name", "Sown").then(async (e) => {
                console.log(e)
                    i.update({
                        content: "Modification faite !",
                        embeds: [],
                        components: []
                    })

                    await sleep(800)

                    embed()

                })
            } else if (selectedOption === 'bio') {

            }


        })
    }
};