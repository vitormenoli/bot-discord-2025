require('colors')

const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath:"./Databases/data.json" });

const Discord = require("discord.js");

module.exports = {
    name: 'leave',
    execute: (client) => {
        client.on('guildMemberRemove', (member) => {
            const channelId = db.get(`logs_saida_${member.guild.id}`)
            if (!channelId) return

            const channel = member.guild.channels.cache.get(channelId)
            if (!channel) return

            const embed = new Discord.EmbedBuilder()
            .setTitle(`Até Logo ${member.user.username}!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`- 👋 Até logo, ${member}!\n  - Membros no servidor: \`${member.guild.memberCount}\`!`)
            .setColor('Red')
            
            channel.send({ embeds: [embed] })
        })
    }
}