const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./data.json'));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

  // /menu
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== 'menu') return;

    const member = interaction.member;
    const roles = member.roles.cache;

    const isStaff =
      roles.has(config.roles.helper) ||
      roles.has(config.roles.mod) ||
      roles.has(config.roles.admin);

    // BOTTONI PLAYER
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('player_info')
        .setLabel('📄 Info Server')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('player_ticket')
        .setLabel('🎫 Ticket')
        .setStyle(ButtonStyle.Secondary)
    );

    // BOTTONE STAFF (solo staff)
    if (isStaff) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId('staff_menu')
          .setLabel('🛡️ Menu Staff')
          .setStyle(ButtonStyle.Danger)
      );
    }

    return interaction.reply({
      content: '📋 **Menu principale**',
      components: [row],
      ephemeral: true
    });
  }

  // CLICK BOTTONI
  if (interaction.isButton()) {

    // INFO SERVER
    if (interaction.customId === 'player_info') {
      return interaction.reply({
        content: '📄 **Info server RP**\n\nServer GTA 5 RP su console.\nBenvenuto!',
        ephemeral: true
      });
    }

    // TICKET
    if (interaction.customId === 'player_ticket') {
      return interaction.reply({
        content: '🎫 Sistema ticket (in arrivo)',
        ephemeral: true
      });
    }

    // MENU STAFF
    if (interaction.customId === 'staff_menu') {

      const staffRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('staff_roles')
          .setLabel('👮 Gestione Ruoli')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('staff_config')
          .setLabel('⚙️ Config Bot')
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({
        content: '🛡️ **Pannello Staff**',
        components: [staffRow],
        ephemeral: true
      });
    }

    // PLACEHOLDER STAFF
    if (
      interaction.customId === 'staff_roles' ||
      interaction.customId === 'staff_config'
    ) {
      return interaction.reply({
        content: '🚧 Funzione in sviluppo',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
