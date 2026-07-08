// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';

        // DOM Elements
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.totalCount = document.getElementById('totalCount');
        this.completedCount = document.getElementById('completedCount');
        this.remainingCount = document.getElementById('remainingCount');

        this.init();
    }

    init() {
        // Load todos from localStorage
        this.loadTodos();

        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // Render initial state
        this.render();
    }

    // Load todos from localStorage
    loadTodos() {
        const saved = localStorage.getItem('todos');
        this.todos = saved ? JSON.parse(saved) : [];
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // Add a new todo
    addTodo() {
        const text = this.todoInput.value.trim();

        if (!text) {
            alert('Please enter a task');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.push(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.todoInput.focus();
        this.render();
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // Edit todo
    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const newText = prompt('Edit task:', todo.text);
            if (newText !== null && newText.trim()) {
                todo.text = newText.trim();
                this.saveTodos();
                this.render();
            }
        }
    }

    // Delete todo
    deleteTodo(id) {
        if (confirm('Delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.render();
    }

    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }

    // Clear all todos
    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear');
            return;
        }

        if (confirm('Clear ALL tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // Update stats
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;

        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.remainingCount.textContent = remaining;
    }

    // Render todos
    render() {
        this.updateStats();
        const filtered = this.getFilteredTodos();

        // Clear list
        this.todoList.innerHTML = '';

        // Show/hide empty state
        if (this.todos.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.todoList.classList.add('hidden');
        } else if (filtered.length === 0) {
            this.emptyState.textContent = `📝 No ${this.currentFilter} tasks`;
            this.emptyState.classList.remove('hidden');
            this.todoList.classList.add('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.todoList.classList.remove('hidden');

            // Render todos
            filtered.forEach(todo => {
                const todoItem = this.createTodoElement(todo);
                this.todoList.appendChild(todoItem);
            });
        }

        // Disable/enable action buttons
        this.clearCompletedBtn.disabled = this.todos.filter(t => t.completed).length === 0;
        this.clearAllBtn.disabled = this.todos.length === 0;
    }

    // Create todo element
    createTodoElement(todo) {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        item.id = `todo-${todo.id}`;

        item.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                data-id="${todo.id}"
            >
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="todo-btn edit-btn" data-id="${todo.id}">✏️ Edit</button>
                <button class="todo-btn delete-btn" data-id="${todo.id}">🗑️ Delete</button>
            </div>
        `;

        // Event listeners
        item.querySelector('.todo-checkbox').addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        item.querySelector('.edit-btn').addEventListener('click', () => {
            this.editTodo(todo.id);
        });

        item.querySelector('.delete-btn').addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        return item;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});