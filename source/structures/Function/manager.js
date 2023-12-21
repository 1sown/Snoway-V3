const axios = require('axios');
const config = require("../../../config/config")
const config_api = require('./config')



async function prevclear(userId) {
    const response = await axios.post(`${config_api.snoway.panel}/prevname/clear`, {
        userId: userId,
    }, {
        headers: {
            'api-Key': config_api.snoway.api
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}

async function prevget(userId) {
    const response = await axios.post(`${config_api.snoway.panel}/prevname/get`, {
        userId: userId,
    }, {
        headers: {
            'api-key': config_api.snoway.api
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}


async function prevadd(userId, prevname) {
    const response = await axios.post(`${config_api.snoway.panel}/prevname/add`, {
        prevname: prevname,
        userId: userId,
    }, {
        headers: {
            'api-key': config_api.snoway.api
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}

async function nitrotype(userId) {
    const response = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
        headers: {
            'Authorization': "Bot " + config.token
        }

    }).catch(() => { e => console.log(e) })
    return response.data.premium_type
}


module.exports = {
    prevclear,
    prevget,
    prevadd,
    nitrotype
}