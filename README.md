
# 📝 Todo List 
A responsive, single-page Nested Todo App built with **vanilla JavaScript** — no frameworks, no libraries, zero dependencies.

🔗 **Live Demo:** https://rutwik01.github.io/todo-fresher-starter/

---

## 🧰 Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla ES6+)

---

## 🚀 Features Implemented

### ✅ Add Todos
- Type into the input and press **Enter** to add a top-level task
- Each task has a **`+` button** to add a sub-task beneath it
- Sub-tasks appear visually indented below their parent

```
- Buy groceries
    - Buy milk
    - Buy eggs
- Read a book
    - Chapter 1: Introduction
```

### ✅ Drag & Drop (1-Level Nested)
Uses the native **HTML5 Drag API** (`draggable`, `dragstart`, `dragover`, `drop`, `dragend`):

- **Drag a parent task** → reorders it along with all its sub-tasks
- **Drag a sub-task onto another parent** → moves it under that parent
- **Drag a sub-task outside any task** → promotes it to a top-level task
- Visual highlight on the drop target during drag

### ✅ Mark Complete / Delete
- Checkbox on each task to toggle completion
- Completed tasks show a **strikethrough**
- Delete button (`✕`) removes a task and all its sub-tasks

### ✅ Filter Tabs
Three views toggled via tab buttons:

| Tab | Behaviour |
|---|---|
| `#all` | Shows all tasks |
| `#active` | Shows only incomplete tasks |
| `#completed` | Shows only completed tasks |

URL hash updates automatically on filter change. Browser back/forward navigation works.

### ✅ Persistence
- All todos saved to **localStorage** on every change
- Data reloads automatically on page refresh
- Storage key: `three-matters-todos-v1`

### ✅ Responsive Design
- Works on desktop and mobile
- Actions always visible on smaller screens

---

## 🗂️ Project Structure

```
todo-fresher-starter/
├── index.html   # Markup — input, filter tabs, todo list container
├── style.css    # Styles — layout, subtask indent, drag states, filters
└── app.js       # All logic — CRUD, drag & drop, filters, localStorage
```

---

## 🏃 Running Locally

No build step needed. Open directly in a browser:

```bash
git clone https://github.com/YOUR_USERNAME/todo-fresher-starter.git
cd todo-fresher-starter
# Open index.html in your browser
# OR use VS Code Live Server (right-click index.html → Open with Live Server)
```

---

## 💡 Reflections

### Challenges Faced

**1. Subtask drag & drop promotion**  
The hardest part was getting subtask drag-to-promote working reliably. The initial approach used a dedicated "drop zone" element — but the HTML5 Drag API fires `dragover` on whatever DOM element is directly under the cursor. Parent `<li>` elements kept intercepting the event before it could reach the drop zone, even with `e.stopPropagation()`.

Several approaches were tried:
- `stopPropagation()` on subtask dragover — didn't fully prevent parent interception
- Separate drop zone `<div>` outside the `<ul>` — parent `<li>` dragover still fired first
- Document-level `dragover` with `getBoundingClientRect()` — unreliable across browsers

**Final solution:** Shifted the decision entirely to `dragend`, which always fires last and unconditionally — regardless of where the user drops. During drag, we simply track which todo `<li>` the cursor is hovering (`dropTargetId`). When `dragend` fires:
- `dropTargetId` = different parent → move sub under it  
- `dropTargetId` = null (dropped outside any todo) → promote to top-level  
- `dropTargetId` = same parent → do nothing  

This approach bypasses all event bubbling issues entirely.

**2. `dragend` firing before `drop`**  
In some browsers, `dragend` fired before the `drop` handler completed, causing shared state (`dragSrcSub`) to be cleared too early. Fixed by making `dragend` the single source of truth for all subtask drag outcomes rather than splitting logic across `drop` and `dragend`.

**3. `DOMContentLoaded` timing**  
Early versions wired event listeners at the top level of the script, before the DOM was fully parsed. This caused the Enter key on the input to silently do nothing. Fixed by wrapping all event wiring inside `DOMContentLoaded`.

---

### Suggestions for Improvement


**1. Keyboard Accessibility**  
Currently drag & drop is mouse-only. Adding keyboard shortcuts (e.g. `Alt+↑/↓` to reorder, `Tab` to navigate between tasks) would make the app fully accessible.

**2. Edit in Place**  
There's no way to edit a task after it's created. Double-clicking a task label to edit it inline (using `contenteditable`) would be a natural UX addition.

**3. Multiple Nesting Levels**  
The current implementation supports exactly 1 level of nesting as specified. A recursive render function would enable unlimited nesting depth if needed in future.

**4. Undo / Redo**  
Accidentally deleting a task is unrecoverable. Maintaining an action history stack and exposing `Ctrl+Z` would significantly improve UX.

---

## 📦 Deliverables

- ✅ Live Demo hosted on GitHub Pages
- ✅ Clean, descriptive commit history
- ✅ Organised vanilla JS — no frameworks, no build tools

---

