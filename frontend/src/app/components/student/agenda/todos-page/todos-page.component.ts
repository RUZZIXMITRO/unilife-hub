import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../../../services/agenda/todo.service';
import { TodoDto, CreateTodoDto, PRIORITIES } from '../../../../models/agenda/todo.model';

@Component({
  selector: 'app-todos-page',
  templateUrl: './todos-page.component.html',
  styleUrls: ['./todos-page.component.css']
})
export class TodosPageComponent implements OnInit {
  todos: TodoDto[] = [];
  loading = true;
  showForm = false;
  editingTodoId: number | null = null;

  filter: 'all' | 'pending' | 'completed' | 'overdue' = 'all';
  sortBy: 'priority' | 'dueDate' | 'category' = 'priority';
  searchTerm = '';
  priorities = PRIORITIES;

  newTodo: CreateTodoDto = this.getEmptyTodo();

  constructor(private todoService: TodoService) {}

  ngOnInit(): void { this.loadTodos(); }

  getEmptyTodo(): CreateTodoDto {
    return { title: '', description: '', priority: 'Medium', category: '', dueDate: '' };
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getMyTodos().subscribe({
      next: (data) => { this.todos = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openCreateForm(): void {
    this.editingTodoId = null;
    this.newTodo = this.getEmptyTodo();
    this.showForm = true;
  }

  openEditForm(todo: TodoDto): void {
    this.editingTodoId = todo.id;
    this.newTodo = {
      title: todo.title, description: todo.description,
      priority: todo.priority, category: todo.category,
      dueDate: todo.dueDate ? todo.dueDate.substring(0, 10) : ''
    };
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingTodoId = null;
    this.newTodo = this.getEmptyTodo();
  }

  saveTodo(): void {
    if (!this.newTodo.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }
    if (this.editingTodoId) {
      this.todoService.update(this.editingTodoId, this.newTodo).subscribe({
        next: () => { this.cancelForm(); this.loadTodos(); }
      });
    } else {
      this.todoService.create(this.newTodo).subscribe({
        next: () => { this.cancelForm(); this.loadTodos(); }
      });
    }
  }

  toggleComplete(todo: TodoDto): void {
    if (!todo.isCompleted) {
      this.todoService.markAsCompleted(todo.id).subscribe({
        next: () => this.loadTodos()
      });
    }
  }

  deleteTodo(todo: TodoDto): void {
    if (confirm(`Supprimer "${todo.title}" ?`)) {
      this.todoService.delete(todo.id).subscribe({
        next: () => this.todos = this.todos.filter(t => t.id !== todo.id)
      });
    }
  }

  get filteredTodos(): TodoDto[] {
    let result = [...this.todos];
    if (this.filter === 'pending') result = result.filter(t => !t.isCompleted);
    else if (this.filter === 'completed') result = result.filter(t => t.isCompleted);
    else if (this.filter === 'overdue') result = result.filter(t => t.isOverdue);

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    if (this.sortBy === 'priority') {
      const order: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
      result.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
    } else if (this.sortBy === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (this.sortBy === 'category') {
      result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }
    return result;
  }

  get totalCount(): number { return this.todos.length; }
  get pendingCount(): number { return this.todos.filter(t => !t.isCompleted).length; }
  get completedCount(): number { return this.todos.filter(t => t.isCompleted).length; }
  get overdueCount(): number { return this.todos.filter(t => t.isOverdue).length; }
}