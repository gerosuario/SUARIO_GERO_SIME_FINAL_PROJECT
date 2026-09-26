(function () {

  const API_BASE = '/api/tasks';
 
  let tasks = [];
  let filter = 'all';
  let editingId = null;
  let audioContext = null;
 
  const STATUS_ORDER = ['Pending', 'Completed'];
  const STATUS_LABEL = { Pending: 'Pending', Completed: 'Completed' };

  function playClickSound() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(520, now);
    oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.06);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  document.addEventListener('click', e => {
    if (e.target.closest('button')) playClickSound();
  });
 
  async function load() {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to load tasks');
      tasks = await res.json();
    } catch (e) {
      console.error(e);
      tasks = [];
    }
  }
 
  async function addTask(taskName, dueDate) {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          taskName: taskName.trim(),
          description: '',
          status: 'Pending',
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const created = await res.json();
      tasks.unshift(created);
      render();
    } catch (e) {
      console.error(e);
    }
  }
 
  async function deleteTask(id) {
    const el = listEl.querySelector(`.task[data-id="${id}"]`);
    const removeLocally = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete task');
        tasks = tasks.filter(t => t.taskID !== id);
        render();
      } catch (e) {
        console.error(e);
      }
    };
    if (el) {
      el.classList.add('leaving');
      el.addEventListener('transitionend', removeLocally, { once: true });
    } else {
      await removeLocally();
    }
  }
 
  async function cycleStatus(id) {
    const t = tasks.find(t => t.taskID === id);
    if (!t) return;
    const idx = STATUS_ORDER.indexOf(t.status);
    const nextStatus = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
 
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      t.status = nextStatus;
      render();
      const dot = listEl.querySelector(`.task[data-id="${id}"] .status-badge`);
      if (dot) {
        dot.classList.add('pulse');
        dot.addEventListener('animationend', () => dot.classList.remove('pulse'), { once: true });
      }
    } catch (e) {
      console.error(e);
    }
  }
 
  async function setStatus(id, status) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status: status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const t = tasks.find(t => t.taskID === id);
      if (t) t.status = status;
      render();
    } catch (e) {
      console.error(e);
    }
  }
 
  async function updateTask(id, taskName, status, dueDate) {
    const trimmed = taskName.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          taskName: trimmed,
          status: status,
          dueDate: dueDate || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update task details');
      const t = tasks.find(t => t.taskID === id);
      if (t) {
        t.taskName = trimmed;
        t.status = status;
        t.dueDate = dueDate || null;
      }
    } catch (e) {
      console.error(e);
    }
  }
 
  const listEl = document.getElementById('list');
  const countEl = document.getElementById('count');

  function formatDateInput(value) {
    return value ? String(value).slice(0, 10) : '';
  }

  function formatDueDate(value) {
    const dateValue = formatDateInput(value);
    if (!dateValue) return '';
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateValue;
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }
 
  function render() {
    const visible = tasks.filter(t => filter === 'all' || t.status === filter);
    countEl.textContent = tasks.length
      ? `${tasks.filter(t => t.status === 'Completed').length} of ${tasks.length} done`
      : '';
 
    if (!visible.length) {
      listEl.innerHTML = `<div class="empty">${tasks.length ? 'Nothing here yet.' : 'No tasks yet — add your first one above.'}</div>`;
      return;
    }
 
    listEl.innerHTML = visible.map(t => {
      if (editingId === t.taskID) {
        return `
        <div class="task" data-id="${t.taskID}">
          <div class="edit-row">
            <input type="text" class="edit-input" value="${escapeHtml(t.taskName)}" />
            <select class="edit-status">
              ${STATUS_ORDER.map(s => `<option value="${s}" ${s === t.status ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}
            </select>
            <input type="date" class="edit-due-date" value="${formatDateInput(t.dueDate)}" aria-label="Due date" />
            <button class="save-edit">Save</button>
          </div>
        </div>`;
      }
      return `
      <div class="task ${t.status === 'Completed' ? 'done' : ''}" data-id="${t.taskID}">
        <button class="status-badge" data-status="${t.status}" title="Toggle status">${t.status}</button>
        <div class="task-body">
          <div class="task-title">${escapeHtml(t.taskName)}</div>
          ${t.dueDate ? `<div class="task-meta">Due ${escapeHtml(formatDueDate(t.dueDate))}</div>` : ''}
        </div>
        <div class="task-actions">
          <button class="icon-btn edit-btn">Edit</button>
          <button class="icon-btn delete delete-btn">Delete</button>
        </div>
      </div>`;
    }).join('');
  }
 
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
 
  document.getElementById('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.getElementById('newTask');
    const dueDateInput = document.getElementById('newDueDate');
    if (input.value.trim()) {
      await addTask(input.value, dueDateInput.value);
      input.value = '';
      dueDateInput.value = '';
    }
  });
 
  document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    document.querySelectorAll('#filters button').forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
 
  listEl.addEventListener('click', async e => {
    const taskEl = e.target.closest('.task');
    if (!taskEl) return;
    const id = Number(taskEl.dataset.id);
 
    if (e.target.closest('.status-badge')) { await cycleStatus(id); return; }
    if (e.target.closest('.delete-btn')) { await deleteTask(id); return; }
    if (e.target.closest('.edit-btn')) { editingId = id; render();
      const inp = listEl.querySelector('.edit-input');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
      return;
    }
    if (e.target.closest('.save-edit')) {
      const inp = taskEl.querySelector('.edit-input');
      const sel = taskEl.querySelector('.edit-status');
      const dueDate = taskEl.querySelector('.edit-due-date');
      await updateTask(id, inp.value, sel.value, dueDate.value);
      editingId = null;
      render();
      return;
    }
  });
 
  listEl.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
      e.preventDefault();
      const taskEl = e.target.closest('.task');
      const id = Number(taskEl.dataset.id);
      const sel = taskEl.querySelector('.edit-status');
      const dueDate = taskEl.querySelector('.edit-due-date');
      await updateTask(id, e.target.value, sel.value, dueDate.value);
      editingId = null;
      render();
    }
    if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
      editingId = null;
      render();
    }
  });
 
  document.getElementById('enterBtn').addEventListener('click', () => {
    const welcome = document.getElementById('welcome');
    const app = document.getElementById('app');
    welcome.classList.add('leaving');
    setTimeout(() => {
      welcome.classList.add('hidden');
      app.classList.add('visible');
    }, 320);
  });
 
  (async () => {
    await load();
    render();
  })();
})();