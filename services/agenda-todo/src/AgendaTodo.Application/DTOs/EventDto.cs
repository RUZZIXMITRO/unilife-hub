namespace AgendaTodo.Application.DTOs;

/// <summary>
/// DTO utilisé quand l'API RENVOIE un événement au client.
/// </summary>
public class EventDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string EventType { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string? Location { get; set; }
    public bool HasReminder { get; set; }
    public DateTime CreatedAt { get; set; }
}