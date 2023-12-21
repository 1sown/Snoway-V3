const Snoway = require('../client/index');
const axios = require('axios');
const config = require('./config')
module.exports = {
    async getImageAnime(action) {
        try {
            const actions = ["pat", "hug", "waifu", "cry", "kiss", "slap", "smug", "punch", "smile"];
            if (!actions.includes(action.toLowerCase())) {
                throw `Action inconnue, options d'action valides : ${actions.join(", ")}`;
            }

            const url = `https://api.giphy.com/v1/gifs/search?api_key=${config.api.giphy.token}&rating=g&q=anime+${action}`;
            const response = await axios.get(url);
            if (response.data.data && response.data.data.length > 0) {
                const randomIndex = Math.floor(Math.random() * response.data.data.length);
                const gifUrl = response.data.data[randomIndex].images.preview_gif.url;
                return gifUrl;
            } else {
                console.error('Aucune donnée de GIF trouvée.');
            }
        } catch (erreur) {
            console.error(`Erreur: ${erreur.message || erreur}`);
        }
    },

    maj(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    discordlink(string) {
        const discordInviteRegex = /(https?:\/\/)?(www\.)?(discord\.gg|discord\.me|discordapp\.com\/invite|discord\.com\/invite)\/([a-z0-9-.]+)/i;
        return discordInviteRegex.test(string);
    },

    linkall(string) {
        const generalLinkRegex = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/gi;
        return generalLinkRegex.test(string);
    }


};