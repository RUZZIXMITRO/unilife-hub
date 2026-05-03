using AgendaTodo.Domain.Enums;

namespace AgendaTodo.Domain.Entities;

public class Todo : PlanningItem
{
    public Priority Priority { get; set; } = Priority.Medium;
    public string? Category { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }

    public ICollection<TodoReminder> Reminders { get; set; } = new List<TodoReminder>();

    public override string GetDisplayInfo()
        => $"[{Priority}] {Title} - Échéance: {DueDate:dd/MM/yyyy}";

    public override bool IsActive()
        => !IsCompleted && (DueDate == null || DueDate >= DateTime.UtcNow);

    public bool IsOverdue()
        => !IsCompleted && DueDate.HasValue && DueDate.Value < DateTime.UtcNow;

    public int GetDaysOverdue()
    {
        if (!IsOverdue()) return 0;
        return (DateTime.UtcNow - DueDate!.Value).Days;
    }

    public void MarkAsCompleted()
    {
        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
    }
}