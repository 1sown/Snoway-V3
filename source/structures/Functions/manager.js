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

    }).catch((e) => { console.log(e) })
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

async function prevcount() {
    const response = await axios.post(`${config_api.snoway.panel}/prevname/count`, {
       headers: {
            'api-key': "qaWH30fb9mX3JSlMNb4ig3gaegV3Y56MK7TQ9mky534Q97L44hZmKYZp56uVcG57K7cx4G"
        }

    }).catch(() => { e => console.log(e) })
    console.log(response)
    return response.data
}


async function botget(userId) {
    const response = await axios.post(`${config_api.manager.panel}/bots/get`, {
        ownerId: userId,
    }, {
        headers: {
            'api-key': config_api.manager.key
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}



async function owneradd(botId, userId) {
    const response = await axios.post(`${config_api.manager.panel}/bots/owner/add`, {
        BotId: botId,
        owner: userId
    }, {
        headers: {
            'api-key': config_api.manager.key
        }

    }).catch(() => { })
}

async function ownerdel(botId, userId) {
    const response = await axios.post(`${config_api.manager.panel}/bots/owner/remove`, {
        BotId: botId,
        owner: userId
    }, {
        headers: {
            'api-key': config_api.manager.key
        }

    }).catch(() => { })
}

async function ownerclear(botId) {
    const response = await axios.post(`${config_api.manager.panel}/bots/owner/clear`, {
        BotId: botId,
    }, {
        headers: {
            'api-key': config_api.manager.key
        }

    }).catch(() => { })
}

module.exports = {
    prevclear,
    prevget,
    prevadd,
    botget,
    owneradd,
    ownerdel,
    ownerclear,
    prevcount
}