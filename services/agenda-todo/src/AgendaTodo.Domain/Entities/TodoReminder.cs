namespace AgendaTodo.Domain.Entities;

public class TodoReminder
{
    public int Id { get; set; }
    public int TodoId { get; set; }
    public string ReminderType { get; set; } = "email";
    public DateTime? SentAt { get; set; }

    // Navigation vers Todo
    public Todo Todo { get; set; } = null!;
}