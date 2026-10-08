namespace AgendaTodo.Domain.Entities;

public class EventReminder
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public string ReminderType { get; set; } = "email"; // email, push, notification
    public DateTime ReminderTime { get; set; }
    public bool IsSent { get; set; } = false;
    public DateTime? SentAt { get; set; }

    // Navigation vers Event
    public Event Event { get; set; } = null!;

    public bool ShouldSendNow()
        => !IsSent && ReminderTime <= DateTime.UtcNow;
}