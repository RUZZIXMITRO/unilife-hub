using AgendaTodo.Application.Interfaces.Repositories;
using AgendaTodo.Domain.Entities;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.Infrastructure.Repositories;

public class TodoRepository : ITodoRepository
{
    private readonly AgendaTodoDbContext _context;

    public TodoRepository(AgendaTodoDbContext context)
    {
        _context = context;
    }

    public async Task<Todo?> GetByIdAsync(int id)
    {
        return await _context.Todos
            .Include(t => t.Reminders)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Todo>> GetByUserIdAsync(int userId)
    {
        return await _context.Todos
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Todo>> GetOverdueAsync(int userId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Todos
            .Where(t => t.UserId == userId
                     && !t.IsCompleted
                     && t.DueDate.HasValue
                     && t.DueDate.Value < today)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Todo>> GetPendingAsync(int userId)
    {
        return await _context.Todos
            .Where(t => t.UserId == userId && !t.IsCompleted)
            .OrderBy(t => t.DueDate)
            .ToListAsync();
    }

    public async Task<Todo> AddAsync(Todo todo)
    {
        _context.Todos.Add(todo);
        await _context.SaveChangesAsync();
        return todo;
    }

    public async Task UpdateAsync(Todo todo)
    {
        _context.Todos.Update(todo);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var todo = await _context.Todos.FindAsync(id);
        if (todo != null)
        {
            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
        }
    }
}