using AgendaTodo.Application.Interfaces;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.API.BackgroundServices;

public class OverdueTaskBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OverdueTaskBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(6);

    public OverdueTaskBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<OverdueTaskBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OverdueTaskBackgroundService demarre");
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckOverdueTasks();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur taches en retard");
            }
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task CheckOverdueTasks()
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AgendaTodoDbContext>();
        var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var today = DateTime.UtcNow.Date;

        var overdueTasks = await db.Todos
            .Join(db.Set<Domain.Entities.PlanningItem>(),
                  t => t.Id, pi => pi.Id,
                  (t, pi) => new { Todo = t, PlanningItem = pi })
            .Where(x => !x.Todo.IsCompleted
                     && x.Todo.DueDate.HasValue
                     && x.Todo.DueDate.Value < today)
            .ToListAsync();

        foreach (var item in overdueTasks)
        {
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == item.PlanningItem.UserId
                && n.RelatedTodoId == item.Todo.Id
                && n.Type == "TASK_OVERDUE"
                && n.CreatedAt > DateTime.UtcNow.AddHours(-24));

            if (!alreadySent)
            {
                var daysOverdue = (today - item.Todo.DueDate!.Value.Date).Days;

                await notifService.CreateAsync(
                    item.PlanningItem.UserId,
                    "TASK_OVERDUE",
                    "Tache en retard",
                    $"{item.PlanningItem.Title} est en retard de {daysOverdue} jour(s)",
                    todoId: item.Todo.Id);
            }
        }
    }
}