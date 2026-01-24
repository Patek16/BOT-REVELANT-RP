const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  InteractionType
} = require("discord.js");

/* =========================
   CONFIG IN MEMORIA (STEP 1)
========================= */
const config = {
  staffRoleId: null
};

/* =========================
   CLIENT
========================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* =========================
   READY
========================= */
client.once("ready", () => {
  console.log(`✅ Bot online come ${client.user.tag}`);
});

/* =========================
   SLASH COMMANDS
========================= */
const commands = [
  new SlashCommandBuilder()
    .setName("menu")
    .setDescription("Apri il menu principale del bot")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("setstaff")
    .setDescription("Imposta il ruolo staff del bot")
    .addRoleOption(opt =>
      opt.setName("ruolo")
        .setDescription("Ruolo staff")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken("TOKEN");

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands("YOUR_CLIENT_ID"),
      { body: commands }
    );
    console.log("✅ Slash commands registrati");
  } catch (err) {
    console.error(err);
  }
})();

/* =========================
   INTERACTIONS
========================= */
client.on("interactionCreate", async interaction => {

  /* ---- /setstaff ---- */
  if (interaction.isChatInputCommand() && interaction.commandName === "setstaff") {
    const ruolo = interaction.options.getRole("ruolo");
    config.staffRoleId = ruolo.id;

    return interaction.reply({
      content: `✅ Ruolo staff impostato su **${ruolo.name}**`,
      ephemeral: true
    });
  }

  /* ---- /menu ---- */
  if (interaction.isChatInputCommand() && interaction.commandName === "menu") {

    if (!config.staffRoleId) {
      return interaction.reply({
        content: "⚠️ Ruolo staff non configurato. Usa **/setstaff**",
        ephemeral: true
      });
    }

    const member = interaction.member;
    if (!member.roles.cache.has(config.staffRoleId)) {
      return interaction.reply({
        content: "⛔ Non hai il ruolo staff",
        ephemeral: true
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu_categoria")
      .setPlaceholder("Seleziona una categoria")
      .addOptions([
        {
          label: "Staff",
          description: "Comandi staff",
          value: "staff"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return interaction.reply({
      content: "📂 **Menu Principale**",
      components: [row],
      ephemeral: true
    });
  }

  /* ---- MENU STAFF ---- */
  if (interaction.isStringSelectMenu() && interaction.customId === "menu_categoria") {

    if (interaction.values[0] !== "staff") return;

    const button = new ButtonBuilder()
      .setCustomId("config_bot")
      .setLabel("Configura Bot")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    return interaction.update({
      content: "🛠 **Menu Staff**",
      components: [row]
    });
  }

  /* ---- BOTTONE CONFIG ---- */
  if (interaction.isButton() && interaction.customId === "config_bot") {
    return interaction.reply({
      content: "⚙️ Pannello configurazione (in arrivo)",
      ephemeral: true
    });
  }
});

/* =========================
   LOGIN
========================= */
client.login("TOKEN");
