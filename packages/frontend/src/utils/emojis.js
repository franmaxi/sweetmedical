import emojiMartData from "@emoji-mart/data";

export const EMOJIS_MEDICINA = [
  "🩺", "🏥", "💉", "💊", "🧬", "🧠", "🫀", "🫁", "🦷", "🩹",
  "🧪", "🧑‍⚕️", "👩‍⚕️", "🚑", "🌡️", "🔬", "⚕️", "👁️", "🩻", "👂",
  "☣️", "☢️", "♿", "🚹", "🚺", "🚼", "🛏️", "🧴", "🧼", "🧻",
  "🚿", "🛀", "🛌", "🧑‍🦽", "🧑‍🦼", "🍎", "🥦", "🥗", "🥛", "💧"
];

export const CATEGORIAS_COMPLETAS = [
  {
    key: "medicina",
    label: "🩺 Medicina",
    emojis: EMOJIS_MEDICINA,
  },
  ...emojiMartData.categories.map((cat) => {
    const traducciones = {
      people: "😃 Gente",
      nature: "🐶 Naturaleza",
      foods: "🍎 Comida",
      activity: "⚽ Actividad",
      places: "🚗 Viajes",
      objects: "💼 Objetos",
      symbols: "❤️ Símbolos",
      flags: "🏳️ Banderas"
    };

    const emojisNativos = cat.emojis
      .map((id) => emojiMartData.emojis[id]?.skins?.[0]?.native)
      .filter(Boolean);

    return {
      key: cat.id,
      label: traducciones[cat.id] || cat.id,
      emojis: emojisNativos,
    };
  }).filter((cat) => cat.emojis.length > 0)
];

export const validarUnicoEmoji = (_, value) => {
  if (!value) return Promise.resolve();
  try {
    const segmenter = new Intl.Segmenter("es", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(value.trim()));
    if (segments.length !== 1) {
      return Promise.reject(new Error("Debe ingresar un único emoji"));
    }
    const emojiRegex = /\p{Extended_Pictographic}/u;
    if (!emojiRegex.test(segments[0].segment)) {
      return Promise.reject(new Error("Debe ingresar un emoji válido"));
    }
    return Promise.resolve();
  } catch (e) {
    const regexCompleta = /^(\p{Extended_Pictographic})$/u;
    if (!regexCompleta.test(value.trim())) {
      return Promise.reject(new Error("Debe ingresar un único emoji válido"));
    }
    return Promise.resolve();
  }
};
