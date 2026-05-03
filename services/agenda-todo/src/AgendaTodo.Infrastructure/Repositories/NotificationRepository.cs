using AgendaTodo.Application.Interfaces.Repositories;
using AgendaTodo.Domain.Entities;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AgendaTodoDbContext _context;

    public NotificationRepository(AgendaTodoDbContext context) => _context = context;

    public async Task<Notification?> GetByIdAsync(int id)
        => await _context.Notifications.FirstOrDefaultAsync(n => n.Id == id);

    public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
        => await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Notification>> GetUnreadByUserIdAsync(int userId)
        => await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

    public async Task<int> GetUnreadCountAsync(int userId)
        => await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task<Notification> AddAsync(Notification notification)
    {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
        return notification;
    }

    public async Task UpdateAsync(Notification notification)
    {
        _context.Notifications.Update(notification);
        await _context.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(int userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();
        foreach (var notif in notifications)
        {
            notif.IsRead = true;
            notif.ReadAt = DateTime.UtcNow;
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var notif = await _context.Notifications.FindAsync(id);
        if (notif != null)
        {
            _context.Notifications.Remove(notif);
            await _context.SaveChangesAsync();
        }
    }
}