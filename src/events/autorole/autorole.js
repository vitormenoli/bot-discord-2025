/**
 * Evento: Auto Role (Cargo Automático)
 *
 * Disparado quando um novo membro entra no servidor.
 * Atribui automaticamente um cargo pré-configurado ao novo membro.
 *
 * Funcionalidades:
 * - Verifica se um cargo automático foi configurado para o servidor
 * - Atribui o cargo ao novo membro automaticamente
 * - Trata erros silenciosamente (não quebra o bot)
 * - Utiliza cache para performance
 *
 * Configuração necessária:
 * - Um cargo deve ser definido via comando /set_autorole
 * - A informação é armazenada no banco de dados JSON
 * - O bot precisa ter permissão para gerenciar cargos (Manage Roles)
 */

require("colors");

const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./database/data.json" });

module.exports = {
  name: "autorole",
  /**
   * Executa quando um membro entra no servidor
   * Atribui automaticamente o cargo configurado
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   */
  execute: (client) => {
    // Event Listener: Disparado quando um novo membro entra no servidor
    client.on("guildMemberAdd", (member) => {
      // ===== BUSCA DO CARGO AUTOMÁTICO =====
      // Obtém o ID do cargo automático configurado para este servidor
      const autorole = db.get(`autorole_${member.guild.id}`);

      // Se não há cargo configurado, interrompe a execução
      if (!autorole) return;

      // ===== VALIDAÇÃO DO CARGO =====
      // Obtém o objeto do cargo usando seu ID do cache
      const role = member.guild.roles.cache.get(autorole);

      // Se o cargo não existe ou foi deletado, interrompe a execução
      if (!role) return;

      // ===== ATRIBUIÇÃO DO CARGO =====
      // Adiciona o cargo ao novo membro
      // O .catch(console.error) captura erros sem derrubar o bot
      // Por exemplo: bot sem permissão, cargo acima do bot, membro saiu, etc
      member.roles.add(role).catch(console.error);
    });
  },
};
