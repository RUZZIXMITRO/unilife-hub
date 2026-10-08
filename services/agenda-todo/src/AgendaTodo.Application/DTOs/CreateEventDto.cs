using AgendaTodo.Domain.Enums;

namespace AgendaTodo.Application.DTOs;

/// <summary>
/// DTO utilisé quand le client envoie une requête pour CRÉER ou MODIFIER un événement.
/// </summary>
public class CreateEventDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public EventType EventType { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Location { get; set; }
    public bool HasReminder { get; set; }
    public int? ReminderMinutesBefore { get; set; } // Ex: 1440 = 24h avant
}