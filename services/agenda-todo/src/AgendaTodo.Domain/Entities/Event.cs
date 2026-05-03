using AgendaTodo.Domain.Enums;

namespace AgendaTodo.Domain.Entities;

public class Event : PlanningItem
{
    public EventType EventType { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Location { get; set; }
    public bool HasReminder { get; set; }

    // Un événement peut avoir plusieurs rappels
    public ICollection<EventReminder> Reminders { get; set; } = new List<EventReminder>();

    public override string GetDisplayInfo()
        => $"{Title} - {EventType} - {StartDateTime:dd/MM/yyyy HH:mm} @ {Location}";

    public override bool IsActive()
        => DateTime.UtcNow >= StartDateTime && DateTime.UtcNow <= EndDateTime;

    public int GetDurationInMinutes()
        => (int)(EndDateTime - StartDateTime).TotalMinutes;
}