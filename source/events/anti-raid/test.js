const Discord = require('discord.js');
const map = new Map(); // Map pour stocker le timestamp du dernier message de chaque utilisateur
const ms = require('ms'); // Module pour manipuler les durées

module.exports = {
    name: 'messageCreate',
    /**
     * Méthode invoquée à chaque nouveau message sur le serveur
     * @param {Bot} client - Le client Discord
     * @param {Discord.Message} message - Le message reçu
     */
    run: async (client, message) => {
        // Vérifier si le message provient d'un utilisateur bot
        if (message.author.bot) return;

        // Vérifier si l'utilisateur a déjà envoyé un message récemment
        if (map.has(message.author.id)) {
            // Récupérer le timestamp du dernier message de l'utilisateur
            const lastMessageTime = map.get(message.author.id);
            // Calculer le temps écoulé depuis le dernier message
            const elapsedTime = message.createdTimestamp - lastMessageTime;

            // Si le délai entre les messages est trop court (par exemple, moins de 3 secondes)
            if (elapsedTime < ms('3s')) {
                // Attendre un court délai (par exemple, 1 seconde) pour voir si l'utilisateur va continuer à spammer
                await new Promise(resolve => setTimeout(resolve, ms('1s')));

                // Récupérer le dernier message de l'utilisateur dans le canal
                const lastMessage = message.channel.messages.cache.find(m => m.author.id === message.author.id && m.id !== message.id);
                
                // Vérifier si l'utilisateur continue de spammer après le délai et que le dernier message est le même qu'avant
                if (!lastMessage && !message.deleted) {
                    // Supprimer tous les messages de l'utilisateur qui ont été envoyés récemment
                    message.channel.bulkDelete(100, true).catch(error => {
                        console.error('Erreur lors de la suppression des messages : ', error);
                    });

                    // Envoyer un seul avertissement
                    message.channel.send(`<@${message.author.id}>, arrêtez de spammer!`).then(msg => {
                        // Supprimer le message d'avertissement après un certain délai (par exemple, 5 secondes)
                        setTimeout(() => {
                            msg.delete().catch(error => {
                                console.error('Erreur lors de la suppression du message d\'avertissement : ', error);
                            });
                        }, ms('5s'));
                    });

                    // Vous pouvez également appliquer des sanctions supplémentaires ici, comme un mute ou un kick.
                }
            }
        }

        // Mettre à jour le dernier message de l'utilisateur dans la map avec le timestamp actuel
        map.set(message.author.id, message.createdTimestamp);
    }
}
