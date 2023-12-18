const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
    name: "help",
    description: "Affiche les commandes du bot",
    run: async (client, message, args) => {
        if (args.length === 0) {
            const cmddanslefichier = fs.readdirSync('./source/commands').filter(folder => folder !== 'DEV');
            const module = await client.db.get(`module-help`) || 'normal'

            if (module === 'normal') {
                const totalpag = cmddanslefichier.length;
                let page = 0;

                if (args.length > 0 && !isNaN(args[0])) {
                    page = parseInt(args[0]) - 1;
                    if (page < 0) page = 0;
                    if (page >= totalpag) page = totalpag - 1;
                }

                const generetapage = (pageactuellement) => {
                    const fichiertasoeur = cmddanslefichier[pageactuellement];
                    const cmdFiles = fs.readdirSync(`./source/commands/${fichiertasoeur}`).filter(file => file.endsWith('.js'));

                    const categoryCommands = cmdFiles.map(file => {
                        const command = require(`../${fichiertasoeur}/${file}`);
                        const usage = command.usage || {
                            [command.name]: command.description || "Aucune description disponible"
                        };

                        let description = '';
                        for (const [key, value] of Object.entries(usage)) {
                            description += `\n\`${client.prefix}${key}\`\n${value}`;
                        }
                        return description;
                    });

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.color)
                        .setTitle(fichiertasoeur)
                        .setFooter({ text: `Snoway - Les variables entre les <...> sont des variables obligatoires à placer sous une commande, contrairement aux variables entre les [...] qui elles sont facultatives.` })
                        .setDescription(categoryCommands.join(''));

                    const row = new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('revient')
                                .setLabel('<<<')
                                .setStyle(1)
                                .setDisabled(pageactuellement === 0),
                            new Discord.ButtonBuilder()
                                .setCustomId('suivant')
                                .setLabel('>>>')
                                .setStyle(1)
                                .setDisabled(pageactuellement === totalpag - 1)
                        );

                    return { embeds: [embed], components: [row] };
                };

                const { embeds, components } = generetapage(page);
                const helpMessage = await message.channel.send({ embeds, components });

                const filter = i => i.customId === 'revient' || i.customId === 'suivant';
                const collector = helpMessage.createMessageComponentCollector({ filter });

                collector.on('collect', async i => {
                    if (i.user.id !== message.author.id) {
                        return i.reply({ content: "Tu n'es pas autorisé à interagir avec cette interaction !", flags: 64 })
                    }
                    if (i.customId === 'revient' && page > 0) {
                        page--;
                    } else if (i.customId === 'suivant' && page < totalpag - 1) {
                        page++;
                    }

                    const { embeds, components } = generetapage(page);
                    await i.update({ embeds, components });
                });

            }



            if (module === "onepage") {
                const formattedCategories = [];

                for (const folder of cmddanslefichier) {
                    const cmdfichier = fs.readdirSync(`./source/commands/${folder}`).filter(file => file.endsWith('.js'));
                    const catecmd = [];

                    for (const file of cmdfichier) {
                        const command = require(`../${folder}/${file}`);
                        catecmd.push(`${command.name}`);
                    }

                    formattedCategories.push(`[\`${folder}\`](${client.support})\n\`${catecmd.join('\`, \`')}\``);
                }

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.color)
                    .setTitle('Help')
                    .setDescription(formattedCategories.join('\n\n'))
                    .setFooter(client.footer);

                message.channel.send({ embeds: [embed] });
            }
        }
        if (args.length !== 0) {
            const cmdname = args[0]
            const command = client.commands.get(cmdname) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdname));
            if (!command) {
                return message.reply(`Cette commande n'existe pas. Utilisez \`${client.prefix}help\` pour voir la liste des commandes.`);
            }
            const usage = command.usage || {
                [command.name]: command.description || "Aucune description disponible"
            };
            const fields = [];

            for (const [key, value] of Object.entries(usage)) {
                fields.push({ name: "`" + client.prefix + key + "`", value: value, inline: false });
            }

            const embed = new Discord.EmbedBuilder()

                .setTitle(`Commande : ${command.name}`)
                .setColor(client.color)
                .setFooter(client.footer)
                .addFields(fields);
            const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                .setStyle(5)
                .setURL(client.support)
                .setLabel('Serveur support')
            )

            message.channel.send({ embeds: [embed], components: [row] });
        }
    }
}

