using AgendaTodo.Application.Interfaces;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.API.BackgroundServices;

public class DailyReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyReminderBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1);

    public DailyReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<DailyReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DailyReminderBackgroundService demarre");
        await Task.Delay(TimeSpan.FromSeconds(45), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckDailyReminders();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur rappels du jour");
            }
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task CheckDailyReminders()
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AgendaTodoDbContext>();
        var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var usersWithEventsToday = await db.Set<Domain.Entities.PlanningItem>()
            .Where(pi => db.Events.Any(e => e.Id == pi.Id
                                          && e.StartDateTime >= today
                                          && e.StartDateTime < tomorrow))
            .Select(pi => pi.UserId)
            .Distinct()
            .ToListAsync();

        foreach (var userId in usersWithEventsToday)
        {
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == userId
                && n.Type == "DAILY_REMINDER"
                && n.CreatedAt >= today);

            if (!alreadySent)
            {
                var count = await db.Events
                    .Join(db.Set<Domain.Entities.PlanningItem>(),
                          e => e.Id, pi => pi.Id,
                          (e, pi) => new { Event = e, PlanningItem = pi })
                    .CountAsync(x => x.PlanningItem.UserId == userId
                                  && x.Event.StartDateTime >= today
                                  && x.Event.StartDateTime < tomorrow);

                await notifService.CreateAsync(
                    userId,
                    "DAILY_REMINDER",
                    "Tes evenements du jour",
                    $"Tu as {count} evenement(s) aujourd hui");
            }
        }
    }
}