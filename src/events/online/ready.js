require('colors')

module.exports = {
    name: 'ready',
    execute: (client) => {
        client.on('clientReady', () => {
            console.log(`✅ Estou online em [${client.user.username}]`.green)
        })
    }
}