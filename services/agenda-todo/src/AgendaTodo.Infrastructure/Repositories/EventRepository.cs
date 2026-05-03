using AgendaTodo.Application.Interfaces.Repositories;
using AgendaTodo.Domain.Entities;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.Infrastructure.Repositories;

public class EventRepository : IEventRepository
{
    private readonly AgendaTodoDbContext _context;

    public EventRepository(AgendaTodoDbContext context)
    {
        _context = context;
    }

    public async Task<Event?> GetByIdAsync(int id)
    {
        return await _context.Events
            .Include(e => e.Reminders)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Event>> GetByUserIdAsync(int userId)
    {
        return await _context.Events
            .Where(e => e.UserId == userId)
            .OrderBy(e => e.StartDateTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Event>> GetByDateRangeAsync(int userId, DateTime start, DateTime end)
    {
        return await _context.Events
            .Where(e => e.UserId == userId
                     && e.StartDateTime >= start
                     && e.StartDateTime <= end)
            .OrderBy(e => e.StartDateTime)
            .ToListAsync();
    }

    public async Task<Event> AddAsync(Event ev)
    {
        _context.Events.Add(ev);
        await _context.SaveChangesAsync();
        return ev;
    }

    public async Task UpdateAsync(Event ev)
    {
        _context.Events.Update(ev);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var ev = await _context.Events.FindAsync(id);
        if (ev != null)
        {
            _context.Events.Remove(ev);
            await _context.SaveChangesAsync();
        }
    }
}