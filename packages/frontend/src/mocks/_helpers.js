// Helpers mínimos para que los mocks se comporten como una API async.
// Cuando se integre el backend real, estos se reemplazan por fetch().

const DEFAULT_LATENCY_MS = 120;

export const delay = (ms = DEFAULT_LATENCY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Devuelve los datos como lo haría un endpoint REST (async + clone).
export const ok = async (data) => {
  await delay();
  return structuredClone(data);
};

// Próximo id autoincremental para POSTs simulados.
export const nextId = (lista) =>
  lista.reduce((max, item) => Math.max(max, item.id ?? 0), 0) + 1;
