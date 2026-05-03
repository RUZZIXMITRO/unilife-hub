using AgendaTodo.Domain.Entities;

namespace AgendaTodo.Application.Interfaces.Repositories;

public interface ITodoRepository
{
    Task<Todo?> GetByIdAsync(int id);
    Task<IEnumerable<Todo>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Todo>> GetOverdueAsync(int userId);
    Task<IEnumerable<Todo>> GetPendingAsync(int userId);
    Task<Todo> AddAsync(Todo todo);
    Task UpdateAsync(Todo todo);
    Task DeleteAsync(int id);
}