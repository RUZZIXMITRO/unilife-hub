using AgendaTodo.Application.DTOs;

namespace AgendaTodo.Application.Interfaces;

public interface ITodoService
{
    Task<TodoDto?> GetByIdAsync(int id);
    Task<IEnumerable<TodoDto>> GetUserTodosAsync(int userId);
    Task<IEnumerable<TodoDto>> GetOverdueAsync(int userId);
    Task<IEnumerable<TodoDto>> GetPendingAsync(int userId);
    Task<TodoDto> CreateAsync(int userId, CreateTodoDto dto);
    Task<TodoDto?> UpdateAsync(int id, int userId, CreateTodoDto dto);
    Task<TodoDto?> MarkAsCompletedAsync(int id, int userId);
    Task<bool> DeleteAsync(int id, int userId);
}