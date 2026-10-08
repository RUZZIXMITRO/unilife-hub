using AgendaTodo.Domain.Entities;

namespace AgendaTodo.Application.Interfaces;

public interface INotificationService
{
    Task CreateAsync(int userId, string type, string title, string message, int? eventId = null, int? todoId = null);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
    Task MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
    Task DeleteAsync(int notificationId);
}