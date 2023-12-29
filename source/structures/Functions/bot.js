const Snoway = require('../Client/index');
const axios = require('axios');
const config = require('./config')
const config_bot = require('../../../config/config')
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
    },

    async user(userId) {
        try {
            const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
                headers: {
                    'Authorization': 'Bot ' + config_bot.token,
                },
            });
    
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async invite(invite_url) {
        const response = await axios.get(`https://discord.com/api/v10/invites/${invite_url}`, {
            headers: {
                'Authorization': "Bot " + config_bot.token
            }

        })
        return response.data
    },

    async color(colorArg) {
        const colorMap = {
            "rouge": "#FF0000",
            "vert": "#00FF00",
            "bleu": "#0000FF",
            "noir": "#000000",
            "blanc": "#FFFFFF",
            "rose": "#dc14eb",
            "violet": "#764686",
            "sown": "#e1adff",
            "orange": "#FFA500",
            "jaune": "#FFFF00",
            "marron": "#A52A2A",
            "gris": "#808080",
            "argent": "#C0C0C0",
            "cyan": "#00FFFF",
            "lavande": "#E6E6FA",
            "corail": "#FF7F50",
            "beige": "#F5F5DC",
            "defaut": config_bot.color
        };

        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const lowerCaseColorArg = colorArg.toLowerCase();
        if (lowerCaseColorArg in colorMap) {
            const color = colorMap[lowerCaseColorArg];
            return color;
        } else if (colorRegex.test(colorArg)) {
            return colorArg;
        } else {
            return false;
        }
    }


};