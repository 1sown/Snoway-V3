const key = "eHNdapE343dET5GY5ktc978ABhg4w3suD5Ny4sEW4F5KLg8u84"
const panel = "http://51.255.28.120:3000/api"
const axios = require('axios');
const config = require('../../../../config/config')

async function prevclear(userId) {
    const response = await axios.post(`${panel}/prevname/clear`, {
        userId: userId,
    }, {
        headers: {
            'api-key': key
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}

async function prevget(userId) {
    const response = await axios.post(`${panel}/prevname/get`, {
        userId: userId,
    }, {
        headers: {
            'api-key': key
        }

    }).catch(() => { e => console.log(e) })
    return response.data
}


async function prevadd(userId, prevname) {
    const response = await axios.post(`${panel}/prevname/add`, {
        prevname: prevname,
        userId: userId,
    }, {
        headers: {
            'api-key': key
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