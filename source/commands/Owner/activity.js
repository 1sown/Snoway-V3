const Discord = require('discord.js');
const Snoway = require('../../structures/client/index');

module.exports = {
    name: 'activity',
    description: 'Affiche la liste des serveurs sur lesquels le bot est présent',
    usage: {
        "activity playing <message>": "Affiche le statut de bot comme si il jouait à un jeu",
        "activity streaming <message>": "Affiche le statut du bot comme si il était en live",
        "activity listening <message>": "Affiche le statut du bot comme si il écouté de la musique",
        "activity watching <message>": "Affiche le statut du bot comme si il regardait un partage d'écran",
        "activity competing <message>": "Affiche la statut du bot comme si il était en pleine compétition",
        "activity clear": "Supprime le message d'activité du bot",
    },
    /**
     * 
     * @param {Snoway} client 
     * @param {Discord.Message} message
     * 
     **/
    run: async (client, message, args) => {
        const db = await client.db.get('status') || {
            type: 3,
            name: "Snoway V3",
            status: 'dnd'
        };
        const activityType = args[0];
        const presence = db.status;
        const name = args.slice(1).join(' ');
        let activity;
        if (activityType === "clear") {
            db.name = "Snoway V" + require('../../../version'),
                db.type = 3
            client.user.setPresence({
                status: presence ? presence : "dnd",
                activities: [
                    {
                        name: "Snoway V" + require('../../../version'),
                        type: 3,
                        url: "https://twitch.tv/oni145"
                    },
                ],
            });
            return message.channel.send("L'activiter a bien était clear !")
        }

        if (activityType === 'playto' || activityType === 'play' || activity === "playing") {
            db.name = name
            db.type = 0
        } else if (activityType === 'watch' || activityType === "watching") {
            db.name = name
            db.type = 3
        } else if (activityType === 'listen' || activityType === 'listening') {
            db.name = name
            db.type = 2
        } else if (activityType === 'stream' || activityType === 'streaming') {
            db.name = name
            db.type = 1
        } else if (activityType === 'competing' || activity === "compet") {
            db.name = name
            db.type = 5
        } else {
            return message.channel.send({ content: `Veuillez spécifier un type d'activité valide : \`${client.prefix}activity playing\`, \`${client.prefix}activity watching\`, \`${client.prefix}activity competing\`, \`${client.prefix}activity listen\` ou \`${client.prefix}activity streaming\``, allowedMentions: { repliedUser: false } });
        }


        await client.db.set('status', db)
        await message.channel.send({ content: `L'activité du bot a été changée en \`${activityType}\` \`${name}\`.` });

        client.user.setPresence({
            status: presence ? presence : "dnd",
            activities: [
                {
                    name: db?.name,
                    type: db?.type,
                    url: "https://twitch.tv/oni145"
                },
            ],
        });

    }
};