// -------------------------------------------------
//  Nested Todo App — Vanilla JS (Fixed Drag & Drop)
// -------------------------------------------------

const STORAGE_KEY = 'three-matters-todos-v1';

let todos         = [];
let currentFilter = 'all';

// ── Persistence ──────────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function load() {
  try { todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { todos = []; }
}

// ── Helpers ──────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function findTodo(id) { return todos.find(t => t.id === id); }

// ── CRUD ─────────────────────────────────────────
function addTodo(text) {
  text = text.trim();
  if (!text) return;
  todos.push({ id: uid(), text, completed: false, subtasks: [] });
  save(); render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save(); render();
}

function toggleTodo(id) {
  const t = findTodo(id);
  if (!t) return;
  t.completed = !t.completed;
  save(); render();
}

function addSubtask(parentId, text) {
  text = text.trim();
  if (!text) return;
  const parent = findTodo(parentId);
  if (!parent) return;
  parent.subtasks.push({ id: uid(), text, completed: false });
  save(); render();
}

function deleteSubtask(parentId, subId) {
  const parent = findTodo(parentId);
  if (!parent) return;
  parent.subtasks = parent.subtasks.filter(s => s.id !== subId);
  save(); render();
}

function toggleSubtask(parentId, subId) {
  const parent = findTodo(parentId);
  if (!parent) return;
  const sub = parent.subtasks.find(s => s.id === subId);
  if (!sub) return;
  sub.completed = !sub.completed;
  save(); render();
}

function clearCompleted() {
  todos = todos
    .filter(t => !t.completed)
    .map(t => ({ ...t, subtasks: t.subtasks.filter(s => !s.completed) }));
  save(); render();
}

// ── Filter ───────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  window.location.hash = filter;
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}
function matchesFilter(todo) {
  if (currentFilter === 'active')    return !todo.completed;
  if (currentFilter === 'completed') return  todo.completed;
  return true;
}

// ── Inline subtask input ──────────────────────────
function attachSubtaskInput(parentLi, parentId) {
  document.querySelectorAll('.subtask-input-row').forEach(r => r.remove());

  const row = document.createElement('li');
  row.className = 'subtask-input-row';

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'sub-text-input';
  inp.placeholder = 'Add sub-task… press Enter';
  inp.autocomplete = 'off';

  const addBtn = document.createElement('button');
  addBtn.className = 'sub-add-btn';
  addBtn.textContent = 'Add';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'sub-cancel-btn';
  cancelBtn.textContent = '✕';

  row.append(inp, addBtn, cancelBtn);

  const commit = () => {
    if (inp.value.trim()) addSubtask(parentId, inp.value);
    else row.remove();
  };
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); commit(); }
    if (e.key === 'Escape') row.remove();
  });
  addBtn.addEventListener('click', commit);
  cancelBtn.addEventListener('click', () => row.remove());

  parentLi.insertAdjacentElement('afterend', row);
  inp.focus();
}

// ── Footer ───────────────────────────────────────
function updateFooter() {
  let footer = document.getElementById('todo-footer');
  if (!footer) {
    footer = document.createElement('div');
    footer.id = 'todo-footer';
    footer.style.cssText =
      'display:flex;justify-content:space-between;align-items:center;' +
      'margin-top:0.75rem;font-size:0.82rem;color:#777;';
    document.querySelector('.container').appendChild(footer);
  }
  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted =
    todos.some(t => t.completed) ||
    todos.some(t => t.subtasks.some(s => s.completed));
  footer.innerHTML =
    '<span>' + activeCount + ' item' + (activeCount !== 1 ? 's' : '') + ' left</span>' +
    (hasCompleted ? '<button id="clear-btn" style="border:none;background:none;cursor:pointer;color:#e00;font-size:0.82rem;">Clear completed</button>' : '');
  footer.querySelector('#clear-btn')?.addEventListener('click', clearCompleted);
}

// ── Render & Component D&D Logic ─────────────────
function render() {
  const listEl = document.getElementById('todo-list');
  listEl.innerHTML = '';

  const visible = todos.filter(matchesFilter);

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.style.cssText = 'padding:1rem 0;color:#999;font-size:0.9rem;list-style:none;';
    empty.textContent =
      currentFilter === 'completed' ? 'No completed tasks yet.' :
      currentFilter === 'active'    ? 'No active tasks — great work!' :
                                      'No tasks yet. Type above and press Enter!';
    listEl.appendChild(empty);
  }

  visible.forEach(todo => {
    // ---- Main Task Elements ----
    const li = document.createElement('li');
    li.className = 'todo' + (todo.completed ? ' completed' : '');
    li.id = 'todo-' + todo.id;
    li.setAttribute('draggable', 'true');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = todo.completed;
    cb.addEventListener('change', () => toggleTodo(todo.id));

    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = todo.text;

    const subBtn = document.createElement('button');
    subBtn.className = 'subtask-btn';
    subBtn.title = 'Add sub-task';
    subBtn.textContent = '+';
    subBtn.addEventListener('click', () => attachSubtaskInput(li, todo.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'delete';
    delBtn.title = 'Delete';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.append(cb, textSpan, subBtn, delBtn);

    // ---- Main Task D&D Events ----
    li.addEventListener('dragstart', e => {
      e.stopPropagation(); // Prevent container from catching it
      e.dataTransfer.effectAllowed = 'move';
      // Store the payload so the drop target knows what is arriving
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'todo', id: todo.id }));
      setTimeout(() => li.classList.add('dragging'), 0);
    });

    li.addEventListener('dragover', e => {
      e.preventDefault(); 
      e.stopPropagation();
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      li.classList.add('drag-over');
    });

    li.addEventListener('dragleave', e => {
      li.classList.remove('drag-over');
    });

    li.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      li.classList.remove('drag-over');
      
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      
      // NEW MATH LOGIC: Calculate mouse position relative to the task being dropped on
      const rect = li.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const dropOnTopHalf = relY < (rect.height / 2);
      
      try {
        const data = JSON.parse(dataStr);

        // 1. Reordering Main Tasks
        if (data.type === 'todo') {
          if (data.id === todo.id) return;
          const si = todos.findIndex(t => t.id === data.id);
          const ti = todos.findIndex(t => t.id === todo.id);
          if (si === -1 || ti === -1) return;
          
          const [moved] = todos.splice(si, 1);
          // If dropped on the top half, insert before. Otherwise, insert after.
          todos.splice(dropOnTopHalf ? ti : ti + 1, 0, moved);
          save(); render();
        } 
        
        // 2. Handling Dragged Subtasks
        else if (data.type === 'subtask') {
          const srcParent = findTodo(data.parentId);
          if (!srcParent) return;
          
          const si = srcParent.subtasks.findIndex(s => s.id === data.id);
          if (si === -1) return;

          if (dropOnTopHalf) {
            // PROMOTION: Dropped on the top half -> Make it a top-level task BEFORE this task
            const [movedSub] = srcParent.subtasks.splice(si, 1);
            const targetIndex = todos.findIndex(t => t.id === todo.id);
            todos.splice(targetIndex, 0, { 
              id: movedSub.id, 
              text: movedSub.text, 
              completed: movedSub.completed, 
              subtasks: [] 
            });
            save(); render();
          } else {
            // ADOPTION: Dropped on the bottom half -> Make it a subtask of THIS main task
            if (data.parentId === todo.id) return; // Prevent dropping on its own parent
            const [movedSub] = srcParent.subtasks.splice(si, 1);
            todo.subtasks.push(movedSub);
            save(); render();
          }
        }
      } catch(err) { console.error('Drag drop error:', err); }
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    listEl.appendChild(li);

    // ---- Subtask Elements ----
    todo.subtasks.forEach(sub => {
      const sli = document.createElement('li');
      sli.className = 'todo subtask' + (sub.completed ? ' completed' : '');
      sli.id = 'sub-' + sub.id;
      sli.setAttribute('draggable', 'true');

      const sCb = document.createElement('input');
      sCb.type = 'checkbox';
      sCb.checked = sub.completed;
      sCb.addEventListener('change', () => toggleSubtask(todo.id, sub.id));

      const sSpan = document.createElement('span');
      sSpan.className = 'text';
      sSpan.textContent = sub.text;

      const sDel = document.createElement('button');
      sDel.className = 'delete';
      sDel.title = 'Delete sub-task';
      sDel.textContent = '✕';
      sDel.addEventListener('click', () => deleteSubtask(todo.id, sub.id));

      sli.append(sCb, sSpan, sDel);

      // ---- Subtask D&D Events ----
      sli.addEventListener('dragstart', e => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        // Payload specific to subtasks
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'subtask', parentId: todo.id, id: sub.id }));
        setTimeout(() => sli.classList.add('dragging'), 0);
      });

      sli.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
        // Highlight the parent main task to show it will be dropped in the same group
        li.classList.add('drag-over'); 
      });

      sli.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        li.classList.remove('drag-over');
        
        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return;

        try {
          const data = JSON.parse(dataStr);
          // If a subtask is dropped onto another subtask, move it to that subtask's parent
          if (data.type === 'subtask' && data.parentId !== todo.id) {
            const srcParent = findTodo(data.parentId);
            if (!srcParent) return;
            const si = srcParent.subtasks.findIndex(s => s.id === data.id);
            if (si !== -1) {
              const [movedSub] = srcParent.subtasks.splice(si, 1);
              todo.subtasks.push(movedSub);
              save(); render();
            }
          }
        } catch(err) { console.error(err); }
      });

      sli.addEventListener('dragend', e => {
        e.stopPropagation();
        sli.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      });

      listEl.appendChild(sli);
    });
  });

  updateFooter();
}

// ── Boot & Global Drag Listners ──────────────────
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('new-todo');
  const listEl = document.getElementById('todo-list');

  // New Item Input
  inputEl.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;
    addTodo(text);
    inputEl.value = '';
  });

  // Filter Buttons
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['all', 'active', 'completed'].includes(hash)) {
      currentFilter = hash;
      document.querySelectorAll('.filters button').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === hash)
      );
      render();
    }
  });

  // ---- Promoting Subtask to Main Task ----
  // When dropping anywhere in the list that ISN'T intercepted by a specific <li>
  listEl.addEventListener('dragover', e => {
    e.preventDefault(); // crucial to allow drop on the empty space
  });

  listEl.addEventListener('drop', e => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      // Promote Subtask to Main level
      if (data.type === 'subtask') {
        const srcParent = findTodo(data.parentId);
        if (!srcParent) return;
        const si = srcParent.subtasks.findIndex(s => s.id === data.id);
        
        if (si !== -1) {
          const [movedSub] = srcParent.subtasks.splice(si, 1);
          todos.push({ 
            id: movedSub.id, 
            text: movedSub.text, 
            completed: movedSub.completed, 
            subtasks: [] 
          });
          save(); render();
        }
      }
    } catch(err) { console.error(err); }
  });

  load();
  const hash = window.location.hash.replace('#', '');
  if (['all', 'active', 'completed'].includes(hash)) currentFilter = hash;
  document.querySelectorAll('.filters button').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === currentFilter)
  );

  render();
});
