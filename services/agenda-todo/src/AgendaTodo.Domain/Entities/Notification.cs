namespace AgendaTodo.Domain.Entities;

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty; // EVENT_REMINDER, EVENT_DELETED, TASK_OVERDUE, EVENT_IMMINENT, EVENT_24H_BEFORE
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    // Reference optionnelle vers l element source
    public int? RelatedEventId { get; set; }
    public int? RelatedTodoId { get; set; }
}