/**
 * Evento: Member Remove (Membro Saiu)
 *
 * Disparado quando um membro sai ou é removido do servidor.
 * Registra a saída do membro em um canal de logs configurado.
 *
 * Funcionalidades:
 * - Verifica se existe um canal de logs configurado para o servidor
 * - Envia embed de despedida quando membro sai
 * - Exibe informações do membro (avatar, nome, novo total de membros)
 * - Usa cores vermelha para indicar evento de saída
 *
 * Configuração necessária:
 * - Um canal de logs deve ser definido via comando /set_logs
 * - A informação é armazenada no banco de dados JSON
 */

require("colors");

const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database/data.json" });

const Discord = require("discord.js");

module.exports = {
  name: "leave",
  /**
   * Executa quando um membro sai do servidor
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   */
  execute: (client) => {
    // Event Listener: Disparado quando um membro sai ou é removido do servidor
    client.on("guildMemberRemove", (member) => {
      // ===== BUSCA DO CANAL DE LOGS =====
      // Tenta obter o ID do canal de logs de saída configurado para este servidor
      const channelId = db.get(`logs_saida_${member.guild.id}`);

      // Se não há canal configurado, interrompe a execução
      if (!channelId) return;

      // Obtém o canal do Discord pelo ID
      const channel = member.guild.channels.cache.get(channelId);

      // Se o canal não existe ou foi deletado, interrompe a execução
      if (!channel) return;

      // ===== CRIAÇÃO DO EMBED DE DESPEDIDA =====
      const embed = new Discord.EmbedBuilder()
        .setTitle(`Até Logo ${member.user.username}!`) // Título com nome do membro que saiu
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Avatar do membro
        .setDescription(
          `- 👋 Até logo, ${member}!\n  - Membros no servidor: \`${member.guild.memberCount}\`!`
        )
        .setColor("Red"); // Cor vermelha para evento de saída

      // Envia o embed no canal de logs
      channel.send({ embeds: [embed] });
    });
  },
};
