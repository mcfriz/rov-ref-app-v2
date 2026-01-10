/*
  Shared modal loader for Atlas/T4 specs.
  Fetches JSON specs and injects rows into a modal table.
  Edit JSON in public/data/*.json to update values.
*/
type SpecRow = { label: string; value: string };
type SpecPayload = { title?: string; rows?: SpecRow[] };

type SpecsModalConfig = {
  openButtonId: string;
  modalId: string;
  titleId: string;
  closeButtonId: string;
  tableBodyId: string;
  dataUrl: string;
};

export function initSpecsModal(config: SpecsModalConfig) {
  const openBtn = document.querySelector<HTMLButtonElement>(`#${config.openButtonId}`);
  const modal = document.querySelector<HTMLDivElement>(`#${config.modalId}`);
  const title = document.querySelector<HTMLHeadingElement>(`#${config.titleId}`);
  const closeBtn = document.querySelector<HTMLButtonElement>(`#${config.closeButtonId}`);
  const body = document.querySelector<HTMLTableSectionElement>(`#${config.tableBodyId}`);

  if (!openBtn || !modal || !closeBtn || !body) return;

  function close() {
    modal.hidden = true;
  }

  openBtn.addEventListener('click', () => {
    modal.hidden = false;
  });

  closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  async function loadSpecs() {
    try {
      const res = await fetch(config.dataUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as SpecPayload;
      if (title && payload.title) {
        title.textContent = payload.title;
      }
      const rows = Array.isArray(payload.rows) ? payload.rows : [];
      if (!rows.length) {
        body.innerHTML = `<tr><td colspan="2">Specs not available.</td></tr>`;
        return;
      }
      body.innerHTML = rows
        .map((row) => `<tr><th scope="row">${row.label}</th><td>${row.value}</td></tr>`)
        .join('');
    } catch (error) {
      console.error('Failed to load specs data', error);
      body.innerHTML = `<tr><td colspan="2">Specs not available.</td></tr>`;
    }
  }

  loadSpecs();
}
