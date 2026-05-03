namespace AgendaTodo.Domain.Entities;

/// <summary>
/// Classe abstraite parente : tout ce qui est planifiable 
/// (événement OU tâche) hérite de cette classe.
/// Correspond au diagramme de classes UniLife Hub.
/// </summary>
public abstract class PlanningItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Méthodes abstraites : chaque sous-classe doit les implémenter
    public abstract string GetDisplayInfo();
    public abstract bool IsActive();
}