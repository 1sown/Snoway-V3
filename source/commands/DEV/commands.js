const Snoway = require('../../structures/client/index');

module.exports = {
    name: 'commande',
    /**
     * @param {Snoway} client 
     * @param {Message} message
     * * @param {string} args
     * @param {string} nomCommande
     */
    run: async (client, message, args, nomCommande) => {
        try {
            const idServeur = message.guild.id;
            const db = await client.db.get(`perms_${idServeur}`);

            if (!db) {
                console.log('Aucune permission configurée pour ce serveur.');
                return;
            }

            const permissionsPubliques = db.find(perm => perm.public);
            const permissionsCommande = db.find(perm => perm[nomCommande]);
            
            if (permissionsPubliques) {
                const roleUtilisateur = message.member.roles.highest;
                const roleRequis = permissionsCommande ? permissionsCommande[nomCommande].role : null;

                if (!roleRequis || roleUtilisateur.id === roleRequis) {
                    console.log(`L'utilisateur ${message.author.tag} a la permission d'exécuter ${nomCommande}.`);
                } else {
                    console.log(`L'utilisateur ${message.author.tag} n'a pas le rôle requis pour exécuter ${nomCommande}.`);
                }
            } else {
                console.log(`L'utilisateur ${message.author.tag} n'a pas la permission d'exécuter ${nomCommande}.`);
            }
        } catch (erreur) {
            console.error('Erreur dans l\'événement de la commande :', erreur);
        }
    },
};
