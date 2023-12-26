const Discord = require("discord.js");
const { ActivityType } = require("discord.js");
const Snoway = require("../../structures/client/index");

module.exports = {
    name: "ready",
    /**
     *
     * @param {Snoway} client
     */
    run: async (client) => {
        setInterval(async () => {
            const status = await client.db.get('nomstatut');
            const custom = await client.db.get('type');
            const presence = await client.db.get('presence');

            let activityType;
            if (custom === 1) {
                activityType = 1;
            } else if (custom === 3) {
                activityType = 3;
            } else if (custom === 0) {
                activityType = 0;
            } else if (custom === 2) {
                activityType = 2;
            }

            const presenceOptions = {
                status: presence || 'dnd',
                activities: [{
                    name: status || "Snoway V" + client.version,
                    type: activityType || 1,
                    url: "https://twitch.tv/1nsidou"

                }]
            };
            client.user.setPresence(presenceOptions)

        }, 5000)
    }
};
