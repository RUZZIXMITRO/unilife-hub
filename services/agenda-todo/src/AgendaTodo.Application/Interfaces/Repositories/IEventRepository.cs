using AgendaTodo.Domain.Entities;

namespace AgendaTodo.Application.Interfaces.Repositories;

public interface IEventRepository
{
    Task<Event?> GetByIdAsync(int id);
    Task<IEnumerable<Event>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Event>> GetByDateRangeAsync(int userId, DateTime start, DateTime end);
    Task<Event> AddAsync(Event ev);
    Task UpdateAsync(Event ev);
    Task DeleteAsync(int id);
}