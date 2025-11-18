/**
 * Comando: /kick
 *
 * Permite que moderadores e administradores expulsem membros do servidor.
 * A expulsão é uma ação temporária - o membro pode voltar através de convite.
 * O comando solicita confirmação antes de executar a ação.
 *
 * Funcionalidades:
 * - Validação de permissões (requer permissão "KickMembers")
 * - Validações de segurança (não pode expulsar a si mesmo, o bot ou membros não expulsáveis)
 * - Sistema de confirmação com botões (confirmar/cancelar)
 * - Timeout de 15 segundos para resposta
 * - Registro do motivo da expulsão
 *
 * Permissão necessária: Kick Members
 * Parâmetros:
 *   - member (obrigatório): Membro a ser expulso
 *   - reason (opcional): Motivo da expulsão
 */

const Discord = require("discord.js");
const color = require("../../config").discord.color;

module.exports = {
  name: "kick",
  description: "Expulsa um membro do servidor.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "member",
      description: "Member to kick.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for the kick.",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  /**
   * Função executada ao usar o comando /kick
   *
   * @param {Discord.Client} client - Instância do cliente Discord
   * @param {Discord.Interaction} interaction - Interação do slash command
   * @returns {Promise<void>}
   */
  run: async (client, interaction) => {
    // ===== VALIDAÇÃO DE PERMISSÕES =====
    // Verifica se o usuário que executou o comando tem permissão de expulsar membros
    if (
      !interaction.member.permissions.has(
        Discord.PermissionFlagsBits.KickMembers
      )
    ) {
      return interaction.reply({
        content: "❌ Você não tem permissão para usar este comando.",
        flags: Discord.MessageFlags.Ephemeral,
      });
    }

    // ===== EXTRAÇÃO DE PARÂMETROS =====
    const user = interaction.options.getUser("member");
    const member = interaction.guild.members.cache.get(user.id);
    const reason = interaction.options.getString("reason") || "Not provided";

    // ===== CRIAÇÃO DOS BOTÕES =====
    // Botão de confirmação (verde/sucesso)
    const buttons = {
      confirm: new Discord.ButtonBuilder()
        .setCustomId("confirm_kick")
        .setLabel("Confirmar")
        .setStyle(Discord.ButtonStyle.Success),
      // Botão de cancelamento (vermelho/perigo)
      cancel: new Discord.ButtonBuilder()
        .setCustomId("cancel_kick")
        .setLabel("Cancelar")
        .setStyle(Discord.ButtonStyle.Danger),
    };

    // Agrupa os botões em uma linha de ação
    const row = new Discord.ActionRowBuilder().addComponents([
      buttons.confirm,
      buttons.cancel,
    ]);

    // ===== VALIDAÇÕES DE SEGURANÇA =====
    // Verifica se o membro existe no cache do servidor
    if (!member)
      return interaction.reply({
        content: "❌ Membro não encontrado no servidor.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    // Verifica se o usuário está tentando expulsar a si mesmo
    if (member.user.id === interaction.user.id)
      return interaction.reply({
        content: "❌ Você não pode se expulsar.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    // Verifica se o usuário está tentando expulsar o bot
    if (member.user.id === client.user.id)
      return interaction.reply({
        content: "❌ Você não pode me expulsar.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    // Verifica se o bot tem permissão para expulsar este membro
    // (considera posição de cargos e permissões)
    if (!member.kickable)
      return interaction.reply({
        content:
          "❌ Não posso expulsar este membro. Verifique minha permissão e a hierarquia de cargos.",
        flags: Discord.MessageFlags.Ephemeral,
      });

    // ===== CRIAÇÃO DO EMBED DE CONFIRMAÇÃO =====
    const embed = new Discord.EmbedBuilder()
      .setColor(color)
      .setTitle("Confirmação de Expulsão")
      .setDescription(
        `> 🔎 Você tem certeza que deseja expulsar ${member} do servidor?\n\n> 📔 **Reason:** ${reason}`
      );

    // Envia a mensagem com os botões e aguarda resposta
    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    // ===== CONFIGURAÇÃO DO COLETOR DE INTERAÇÕES =====
    // Define um filtro para aceitar apenas cliques do usuário que executou o comando
    const filter = (i) =>
      i.user.id === interaction.user.id &&
      (i.customId === "confirm_kick" || i.customId === "cancel_kick");

    // Cria um coletor que aguarda por cliques de botão
    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15_000, // Timeout de 15 segundos
      max: 1, // Máximo de 1 interação
    });

    // ===== EVENTO: QUANDO BOTÃO É CLICADO =====
    collector.on("collect", async (i) => {
      // Defere a atualização para mostrar que foi processado
      await i.deferUpdate();

      // Cria novo embed para a resposta
      const embed = new Discord.EmbedBuilder().setColor(color);

      // Verifica qual botão foi clicado
      if (i.customId === "confirm_kick") {
        try {
          // Executa a expulsão
          await member.kick(reason);

          // Atualiza o embed com mensagem de sucesso
          embed
            .setTitle("Expulsão Confirmada")
            .setDescription(
              `> ✅ O membro ${member} foi expulso com sucesso!\n\n> 📔 **Reason:** ${reason}`
            );

          interaction.editReply({ embeds: [embed], components: [] });
        } catch (error) {
          // Se houver erro durante a expulsão
          embed
            .setColor("Red")
            .setTitle("Erro ao Expulsar Membro")
            .setDescription(
              `❌ Não foi possível expulsar o membro ${member}. Verifique minha permissão e a hierarquia de cargos.`
            );
          interaction.editReply({ embeds: [embed], components: [] });
        }
      } else {
        // Usuário clicou em "Cancelar"
        embed
          .setColor("Red")
          .setTitle("Expulsão Cancelada")
          .setDescription(`> ❌ A expulsão do membro ${member} foi cancelada.`);
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });

    // ===== EVENTO: QUANDO COLETOR TERMINA (TIMEOUT) =====
    collector.on("end", (collected) => {
      // Se nenhuma interação foi coletada, o timeout expirou
      if (collected.size === 0) {
        const embed = new Discord.EmbedBuilder()
          .setColor("Orange")
          .setTitle("Tempo Esgotado")
          .setDescription("⏰ O tempo para confirmar a expulsão expirou.");
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  },
};
