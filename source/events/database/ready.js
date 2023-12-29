const Snoway = require('../../structures/client/index');

module.exports = {
    name: 'ready',
    /**
     * @param {Snoway} client 
     */
    run: async (client) => {
        try {
            for (const guild of client.guilds.cache.values()) {
                const db = await client.db.get(`perms_${guild.id}`);

                if (!db) {
                    const permsnonconfig = [{
                        public: {
                            commands: []
                        },
                        perm1: {
                            role: null,
                            commands: []
                        }, perm2: {
                            role: null,
                            commands: []
                        }, perm3: {
                            role: null,
                            commands: []
                        }, perm4: {
                            role: null,
                            commands: []
                        }, perm5: {
                            role: null,
                            commands: []
                        }, perm6: {
                            role: null,
                            commands: []
                        }, perm7: {
                            role: null,
                            commands: []
                        }, perm8: {
                            role: null,
                            commands: []
                        }, perm9: {
                            role: null,
                            commands: []
                        },
                    }]

                    await client.db.set(`perms_${guild.id}`, permsnonconfig);
                }
            }
        } catch (error) {
            console.error('Erreur: ', error);
        }
    },
};
