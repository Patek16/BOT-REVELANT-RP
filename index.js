const { 
  Client, 
  GatewayIntentBits, 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");
const fs = require("fs");

// ========= CONFIG =========
const TOKEN = process.env.TOKEN; // <-- METTI IL TOKEN COME SECRET SU GITHUB
const DATA_FILE = "./data.json";

// ========= CLIENT =========
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ========= DATA =========
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      regolamento: "📜 Regolamento non ancora impostato.",
      config: {
        economia: {
          contanti_base: 500,
          banca_base: 2000,
          stipendio_base: 300
        },
        whitelist: {
          ruolo_approvato: "Whitelist"
        }
      },
      users: {},
      candidature: {}
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ========= READY =========
client.once("ready", async () => {
  console.log(`✅ Bot online come ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName("menu")
      .setDescription("Apri il menu RP"),

    new SlashCommandBuilder()
      .setName("regolamento")
      .setDescription("Visualizza il regolamento"),

    new SlashCommandBuilder()
      .setName("setregolamento")
      .setDescription("Modifica il regolamento (staff)")
      .addStringOption(o =>
        o.setName("testo")
          .setDescription("Nuovo regolamento")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("profilo")
      .setDescription("Visualizza il profilo RP"),

    new SlashCommandBuilder()
      .setName("economia")
      .setDescription("Configura l'economia (staff)")
      .addIntegerOption(o => o.setName("contanti").setDescription("Contanti base"))
      .addIntegerOption(o => o.setName("banca").setDescription("Banca base"))
      .addIntegerOption(o => o.setName("stipendio").setDescription("Stipendio base")),

    new SlashCommandBuilder()
      .setName("whitelist")
      .setDescription("Invia la candidatura whitelist")
  ];

  await client.application.commands.set(commands);
});

// ========= INTERACTIONS =========
client.on("interactionCreate", async interaction => {
  const data = loadData();

  // ----- MENU -----
  if (interaction.isChatInputCommand() && interaction.commandName === "menu") {
    const embed = new EmbedBuilder()
      .setTitle("📋 Menu RP")
      .setDescription("Seleziona una sezione")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("player")
        .setLabel("Player")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("staff")
        .setLabel("Staff")
        .setStyle(ButtonStyle.Danger)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  // ----- BUTTONS -----
  if (interaction.isButton()) {
    if (interaction.customId === "player") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("👤 Player Menu")
            .setDescription("Usa:\n`/profilo`\n`/regolamento`\n`/whitelist`")
            .setColor("Green")
        ],
        ephemeral: true
      });
    }

    if (interaction.customId === "staff") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🛠️ Staff Panel")
            .setDescription("Usa:\n`/setregolamento`\n`/economia`")
            .setColor("Red")
        ],
        ephemeral: true
      });
    }
  }

  // ----- REGOLAMENTO -----
  if (interaction.isChatInputCommand() && interaction.commandName === "regolamento") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📜 Regolamento")
          .setDescription(data.regolamento)
          .setColor("Gold")
      ],
      ephemeral: true
    });
  }

  if (interaction.isChatInputCommand() && interaction.commandName === "setregolamento") {
    data.regolamento = interaction.options.getString("testo");
    saveData(data);
    return interaction.reply({ content: "✅ Regolamento aggiornato", ephemeral: true });
  }

  // ----- PROFILO -----
  if (interaction.isChatInputCommand() && interaction.commandName === "profilo") {
    const userId = interaction.user.id;

    if (!data.users[userId]) {
      data.users[userId] = {
        contanti: data.config.economia.contanti_base,
        banca: data.config.economia.banca_base
      };
      saveData(data);
    }

    const u = data.users[userId];

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`👤 Profilo RP`)
          .addFields(
            { name: "💵 Contanti", value: `${u.contanti}`, inline: true },
            { name: "🏦 Banca", value: `${u.banca}`, inline: true }
          )
          .setColor("Aqua")
      ],
      ephemeral: true
    });
  }

  // ----- ECONOMIA -----
  if (interaction.isChatInputCommand() && interaction.commandName === "economia") {
    const c = interaction.options.getInteger("contanti");
    const b = interaction.options.getInteger("banca");
    const s = interaction.options.getInteger("stipendio");

    if (c !== null) data.config.economia.contanti_base = c;
    if (b !== null) data.config.economia.banca_base = b;
    if (s !== null) data.config.economia.stipendio_base = s;

    saveData(data);

    return interaction.reply({ content: "✅ Economia aggiornata", ephemeral: true });
  }

  // ----- WHITELIST -----
  if (interaction.isChatInputCommand() && interaction.commandName === "whitelist") {
    const modal = new ModalBuilder()
      .setCustomId("whitelist_modal")
      .setTitle("Whitelist RP");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("nome")
          .setLabel("Nome RP")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("eta")
          .setLabel("Età RP")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("esperienza")
          .setLabel("Esperienza RP")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );

    return interaction.showModal(modal);
  }

  // ----- MODAL -----
  if (interaction.isModalSubmit() && interaction.customId === "whitelist_modal") {
    data.candidature[interaction.user.id] = {
      nome: interaction.fields.getTextInputValue("nome"),
      eta: interaction.fields.getTextInputValue("eta"),
      esperienza: interaction.fields.getTextInputValue("esperienza")
    };

    saveData(data);

    return interaction.reply({ content: "✅ Candidatura inviata!", ephemeral: true });
  }
});

// ========= LOGIN =========
client.login(TOKEN);
