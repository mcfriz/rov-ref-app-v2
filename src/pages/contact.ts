// Contact page script: posts feedback via Formspree and shows inline status.
import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root element #app not found');
}

const formEndpoint = 'https://formspree.io/f/xwvenbbq';
const githubIssuesUrl = 'https://github.com/<youruser>/<repo>/issues/new'; // TODO: replace with real repo issues URL.

app.innerHTML = `
  <main class="page narrow-page">
    <p class="back"><a href="../index.html">&larr; Back to dashboard</a></p>
    <header class="page-header">
      <h1>Contact</h1>
      <p class="lead">Send feedback, request features, or report an issue.</p>
    </header>

    <section class="card finder-card">
      <form id="contact-form" class="finder-form">
        <div class="field">
          <label for="category">Category *</label>
          <select id="category" name="category" required>
            <option value="">Select a category</option>
            <option>General</option>
            <option>Feature request</option>
            <option>Bug / error</option>
            <option>Data correction</option>
          </select>
        </div>

        <div class="field">
          <label for="tool">Tool / Page</label>
          <select id="tool" name="tool">
            <option value="">Select a tool (optional)</option>
            <option>Dashboard</option>
            <option>Fitting Finder</option>
            <option>Cable Finder</option>
            <option>ROV Cheat Sheet</option>
            <option>ROV Pod</option>
            <option>T4 Torque</option>
            <option>T4 Slave Arm Drawing</option>
            <option>T4 Videos</option>
            <option>Other</option>
          </select>
        </div>

        <div class="field">
          <label for="subject">Subject *</label>
          <input id="subject" name="subject" type="text" required />
        </div>

        <div class="field">
          <label for="message">Message *</label>
          <textarea id="message" name="message" rows="4" required></textarea>
        </div>

        <div class="field">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" />
        </div>

        <div class="field checkbox-field">
          <label>
            <input type="checkbox" id="device-info" name="deviceInfo" />
            Include device info
          </label>
          <p class="helper-text">Adds browser, screen size, and page URL to help debug.</p>
        </div>

        <div class="button-row">
          <button type="submit" class="btn primary" id="submit-btn">Submit</button>
          <button type="button" class="btn ghost" id="clear-btn">Clear</button>
        </div>

        <p class="helper-text">Don’t include sensitive client/vessel information.</p>
        <div id="form-status" class="form-status" aria-live="polite"></div>
      </form>
    </section>

    <section class="card">
      <div class="card-header-row">
        <h2>Prefer GitHub issues?</h2>
      </div>
      <p>If you have a GitHub account, you can also raise an issue for tracking.</p>
      <div class="button-row">
        <a class="btn ghost" href="${githubIssuesUrl}" target="_blank" rel="noopener">Open GitHub Issues</a>
      </div>
    </section>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#contact-form');
const statusEl = document.querySelector<HTMLDivElement>('#form-status');
const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn');
const clearBtn = document.querySelector<HTMLButtonElement>('#clear-btn');

function setStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `form-status status-${type}`;
}

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: (navigator as any).platform ?? 'unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    url: window.location.href,
  };
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  if (!form || !submitBtn) return;

  const formData = new FormData(form);
  const includeDevice = (document.querySelector<HTMLInputElement>('#device-info')?.checked ?? false);

  const payload: Record<string, unknown> = {
    category: formData.get('category') ?? '',
    tool: formData.get('tool') ?? '',
    subject: formData.get('subject') ?? '',
    message: formData.get('message') ?? '',
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
  };

  if (includeDevice) {
    payload.deviceInfo = getDeviceInfo();
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  setStatus('Sending your message…', 'info');

  try {
    const response = await fetch(formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    form.reset();
    setStatus('Thanks! Your message was sent successfully.', 'success');
  } catch (error) {
    console.error('Form submit failed', error);
    setStatus('Something went wrong. Please try again or use the GitHub Issues link below.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

function clearForm() {
  form?.reset();
  setStatus('', 'info');
  const subject = document.querySelector<HTMLInputElement>('#subject');
  subject?.focus();
}

form?.addEventListener('submit', handleSubmit);
clearBtn?.addEventListener('click', clearForm);
