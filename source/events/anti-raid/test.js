const Discord = require('discord.js');
const ms = require('ms');

const spamTimeout = 3000; 

const spamUsers = {};
module.exports = {
    name: 'messageCreate',

    run: async (client, message) => {
        if (message.author.bot || !message.guild) return;

        const userId = message.author.id;

        if (spamUsers[userId]) {
            const lastMessageTime = spamUsers[userId].lastMessageTime;
            const currentTime = Date.now();

            if (currentTime - lastMessageTime < spamTimeout) {
                spamUsers[userId].lastMessageTime = currentTime;

                clearTimeout(spamUsers[userId].warnTimeout);
                spamUsers[userId].warnTimeout = setTimeout(() => {
                    sendSpamWarning(client, Object.keys(spamUsers), message.channelId);
                    resetSpamData(Object.keys(spamUsers));
                }, spamTimeout);

                return;
            }
        }

        spamUsers[userId] = {
            lastMessageTime: Date.now()
        };
    }
}

function sendSpamWarning(client, userIds, channelId) {
    if(userIds.length === 0) return;
    const warningMessage = `${userIds.map(userId => `<@${userId}>`).join(', ')}, Le spam est interdit sur ce serveur !`;
    client.channels.cache.get(channelId).send(warningMessage);
}

function resetSpamData(userIds) {
    userIds.forEach(userId => {
        delete spamUsers[userId];
    });
}
