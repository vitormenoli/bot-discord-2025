/**
 * Comando: /clear
 *
 * Permite que moderadores limpem/deletem mensagens em massa de um canal.
 * O comando deleta de 1 a 100 mensagens por vez.
 *
 * Funcionalidades:
 * - Validação de permissões (requer permissão "ManageMessages")
 * - Validação de quantidade (mínimo 1, máximo 100)
 * - Feedback ao usuário sobre quantidade de mensagens deletadas
 * - Tratamento de erros
 *
 * Permissão necessária: Manage Messages
 * Parâmetros:
 *   - amount (obrigatório): Quantidade de mensagens a limpar (1-100)
 */

const Discord = require("discord.js");
const color = require("../../config").discord.color;

module.exports = {
  name: "clear",
  description: "Limpa o chat atual.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "amount",
      description: "Quantidade de mensagens a serem limpas (1-100).",
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],

  /**
   * Função executada ao usar o comando /clear
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   * @param {Discord.Interaction} interaction - Interação do slash command
   * @returns {Promise<void>}
   */
  run: async (client, interaction) => {
    // ===== VALIDAÇÃO DE PERMISSÕES =====
    // Verifica se o usuário que executou o comando tem permissão de gerenciar mensagens
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    // ===== EXTRAÇÃO DE PARÂMETROS =====
    const amount = interaction.options.getInteger("amount");

    // ===== CRIAÇÃO DO EMBED =====
    const embed = new Discord.EmbedBuilder().setColor(color);

    // ===== VALIDAÇÃO DE QUANTIDADE =====
    // Verifica se a quantidade está dentro do intervalo permitido (1-100)
    if (amount < 1 || amount > 100) {
      embed.setColor("Red");
      embed.setDescription(`❌ A quantidade deve estar entre 1 e 100.`);

      return interaction.reply({
        embeds: [embed],
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    // ===== DELEÇÃO DE MENSAGENS =====
    // Executa a deleção em massa do canal
    interaction.channel
      .bulkDelete(amount, true)
      .then((deletedMessages) => {
        // Se bem-sucedido, exibe a quantidade de mensagens deletadas
        embed.setDescription(
          `🧹 Limpei \`${deletedMessages.size}\` mensagens do chat.`
        );
        interaction.reply({ embeds: [embed] });
      })
      .catch((err) => {
        // Se houver erro, exibe mensagem de erro e faz log do problema
        console.error("Erro ao limpar mensagens: ", err);
        embed.setColor("Red");
        embed.setDescription(
          `❌ Não foi possível limpar as mensagens neste canal.`
        );
        interaction.reply({
          embeds: [embed],
          flags: Discord.MessageFlags.Ephemeral,
        });
      });
  },
};
