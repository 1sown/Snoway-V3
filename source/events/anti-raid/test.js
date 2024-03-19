const Discord = require('discord.js');
const ms = require('ms');

const raid = new Map();
const config = {
    sanction: ["Mute"],
    logsstatus: true,
    logs: '1217857016110776430'
};
module.exports = {
    name: 'messageCreate',

    run: async (client, message) => {
        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;

        if (raid.has(userId)) {
            const userData = raid.get(userId);

            const lastMessageTime = userData.lastMessageTime;
            const currentTime = Date.now();

            if (currentTime - lastMessageTime < 3000) {
                userData.lastMessageTime = currentTime;

                clearTimeout(userData.warnTimeout);
                userData.warnTimeout = setTimeout(() => {
                    if (!userData.warned) {
                        userData.warned = true;
                        sendSpamWarning(client, Array.from(raid.keys()), message.channel.id, Array.from(raid.values()));
                        resetSpamData(Array.from(raid.values()), message.channel);
                    }
                }, 3000);

                if (!userData.messages) {
                    userData.messages = [];
                }
                userData.messages.push(message);

                return;
            }
        }

        raid.set(userId, {
            lastMessageTime: Date.now(),
            messages: [message]
        });
    }
}

function sendSpamWarning(client, userIds, channelId, userDataArray) {
    if (userIds.length === 0) return;
    const messagesToDelete = userDataArray.reduce((acc, userData) => {
        if (userData && userData.messages) {
            acc.push(...userData.messages.map(msg => msg.id));
        }
        return acc;
    }, []);
    const warningMessage = `${userIds.map(userId => `<@${userId}>`).join(', ')}, Le spam est interdit sur ce serveur !`;
    const channel = client.channels.cache.get(channelId)
    channel.send(warningMessage).then((m) => setTimeout(() => m.delete(), 3000));
    const mentionUsers = userIds.map(userId => {
        const user = client.users.cache.get(userId)
        return `${user.username} (ID: ${user.id})`
    }).join('\n')

    
    let embed = new Discord.EmbedBuilder()
        .setFooter({ text: `${messagesToDelete.length || 0} messages supprimés dans ${channel.name}`, iconURL: channel.guild.iconURL() })
        .setTimestamp()
        .setAuthor({ name: "・ Actions non autorisées" })
        .addFields({ name: "・Utilisateurs", value: `\`\`\`py\n${mentionUsers}\`\`\`` })
        .addFields({ name: "・Sanction", value: `\`\`\`py\n${config.sanction[0]}\`\`\`` })
        .addFields({ name: "・Modifications apportées", value: "\`\`\`py\nMessages contenants du spam\`\`\`" })
        .setColor(client.color);
    const logsChannel = client.channels.cache.get(config.logs)
    logsChannel?.send({ embeds: [embed] })
}

async function resetSpamData(userDataArray, channel) {
    const messagesToDelete = userDataArray.reduce((acc, userData) => {
        if (userData && userData.messages) {
            acc.push(...userData.messages.map(msg => msg.id));
        }
        return acc;
    }, []);

    try {
        await channel.bulkDelete(messagesToDelete.slice(0, 100));
    } catch (error) {
        console.error('Erreur:', error);
    }

    raid.clear();
}