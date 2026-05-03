using AgendaTodo.Domain.Enums;

namespace AgendaTodo.Application.DTOs;

public class CreateTodoDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public string? Category { get; set; }
    public DateTime? DueDate { get; set; }
}