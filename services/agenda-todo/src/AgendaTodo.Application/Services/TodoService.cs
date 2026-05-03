using AgendaTodo.Application.DTOs;
using AgendaTodo.Application.Interfaces;
using AgendaTodo.Domain.Entities;
using AgendaTodo.Application.Interfaces.Repositories;
namespace AgendaTodo.Application.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repository;

    public TodoService(ITodoRepository repository)
    {
        _repository = repository;
    }

    public async Task<TodoDto?> GetByIdAsync(int id)
    {
        var todo = await _repository.GetByIdAsync(id);
        return todo == null ? null : MapToDto(todo);
    }

    public async Task<IEnumerable<TodoDto>> GetUserTodosAsync(int userId)
    {
        var todos = await _repository.GetByUserIdAsync(userId);
        return todos.Select(MapToDto);
    }

    public async Task<IEnumerable<TodoDto>> GetOverdueAsync(int userId)
    {
        var todos = await _repository.GetOverdueAsync(userId);
        return todos.Select(MapToDto);
    }

    public async Task<IEnumerable<TodoDto>> GetPendingAsync(int userId)
    {
        var todos = await _repository.GetPendingAsync(userId);
        return todos.Select(MapToDto);
    }

    public async Task<TodoDto> CreateAsync(int userId, CreateTodoDto dto)
    {
        var todo = new Todo
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Category = dto.Category,
            DueDate = dto.DueDate,
            IsCompleted = false
        };

        var created = await _repository.AddAsync(todo);
        return MapToDto(created);
    }

    public async Task<TodoDto?> UpdateAsync(int id, int userId, CreateTodoDto dto)
    {
        var todo = await _repository.GetByIdAsync(id);
        if (todo == null || todo.UserId != userId) return null;

        todo.Title = dto.Title;
        todo.Description = dto.Description;
        todo.Priority = dto.Priority;
        todo.Category = dto.Category;
        todo.DueDate = dto.DueDate;

        await _repository.UpdateAsync(todo);
        return MapToDto(todo);
    }

    public async Task<TodoDto?> MarkAsCompletedAsync(int id, int userId)
    {
        var todo = await _repository.GetByIdAsync(id);
        if (todo == null || todo.UserId != userId) return null;

        todo.MarkAsCompleted(); // méthode du Domain
        await _repository.UpdateAsync(todo);
        return MapToDto(todo);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var todo = await _repository.GetByIdAsync(id);
        if (todo == null || todo.UserId != userId) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private static TodoDto MapToDto(Todo todo) => new()
    {
        Id = todo.Id,
        UserId = todo.UserId,
        Title = todo.Title,
        Description = todo.Description,
        Priority = todo.Priority.ToString(),
        Category = todo.Category,
        DueDate = todo.DueDate,
        IsCompleted = todo.IsCompleted,
        CompletedAt = todo.CompletedAt,
        IsOverdue = todo.IsOverdue(),
        DaysOverdue = todo.GetDaysOverdue(),
        CreatedAt = todo.CreatedAt
    };
}