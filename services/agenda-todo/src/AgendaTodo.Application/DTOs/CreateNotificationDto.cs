namespace AgendaTodo.Application.DTOs;

public class CreateNotificationDto
{
    public int UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int? RelatedEventId { get; set; }
    public int? RelatedTodoId { get; set; }
}