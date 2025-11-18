/**
 * Evento: Member Join (Membro Entrou)
 *
 * Disparado quando um novo membro entra no servidor.
 * Registra a entrada do membro em um canal de logs configurado.
 *
 * Funcionalidades:
 * - Verifica se existe um canal de logs configurado para o servidor
 * - Envia embed de boas-vindas ao novo membro
 * - Exibe informações do membro (avatar, nome, número total de membros)
 * - Usa cores verde para indicar evento positivo
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
  name: "join",
  /**
   * Executa quando um membro entra no servidor
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   */
  execute: (client) => {
    // Event Listener: Disparado quando um novo membro entra no servidor
    client.on("guildMemberAdd", (member) => {
      // ===== BUSCA DO CANAL DE LOGS =====
      // Tenta obter o ID do canal de logs configurado para este servidor
      const channelId = db.get(`logs_entrada_${member.guild.id}`);

      // Se não há canal configurado, interrompe a execução
      if (!channelId) return;

      // Obtém o canal do Discord pelo ID
      const channel = member.guild.channels.cache.get(channelId);

      // Se o canal não existe ou foi deletado, interrompe a execução
      if (!channel) return;

      // ===== CRIAÇÃO DO EMBED DE BEM-VINDAS =====
      const embed = new Discord.EmbedBuilder()
        .setTitle(`Bem Vindo ${member.user.username}!`) // Título com nome do novo membro
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Avatar do membro
        .setDescription(
          `- 👋 Bem-vindo(a) ao servidor, ${member}!\n  - Esperamos que você tenha uma ótima experiência aqui.\n  - Membro número \`${member.guild.memberCount}\`!`
        )
        .setColor("Green"); // Cor verde para evento positivo

      // Envia o embed no canal de logs
      channel.send({ embeds: [embed] });
    });
  },
};
