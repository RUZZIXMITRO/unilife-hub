using AgendaTodo.Application.Interfaces;
using AgendaTodo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.API.BackgroundServices;

public class EventReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EventReminderBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(60);

    public EventReminderBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<EventReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EventReminderBackgroundService demarre");
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckEventReminders();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur rappels evenements");
            }
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task CheckEventReminders()
    {
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AgendaTodoDbContext>();
        var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        var now = DateTime.UtcNow;
        var in1Hour = now.AddHours(1);
        var in24Hours = now.AddHours(24);
        var in25Hours = now.AddHours(25);

        var imminents = await db.Events
            .Join(db.Set<Domain.Entities.PlanningItem>(),
                  e => e.Id, pi => pi.Id,
                  (e, pi) => new { Event = e, PlanningItem = pi })
            .Where(x => x.Event.StartDateTime >= now && x.Event.StartDateTime <= in1Hour)
            .ToListAsync();

        foreach (var item in imminents)
        {
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == item.PlanningItem.UserId
                && n.RelatedEventId == item.Event.Id
                && n.Type == "EVENT_IMMINENT"
                && n.CreatedAt > now.AddHours(-2));

            if (!alreadySent)
            {
                await notifService.CreateAsync(
                    item.PlanningItem.UserId,
                    "EVENT_IMMINENT",
                    "Evenement imminent",
                    $"{item.PlanningItem.Title} commence a {item.Event.StartDateTime:HH:mm}",
                    eventId: item.Event.Id);
            }
        }

        var in24h = await db.Events
            .Join(db.Set<Domain.Entities.PlanningItem>(),
                  e => e.Id, pi => pi.Id,
                  (e, pi) => new { Event = e, PlanningItem = pi })
            .Where(x => x.Event.StartDateTime >= in24Hours && x.Event.StartDateTime <= in25Hours)
            .ToListAsync();

        foreach (var item in in24h)
        {
            var alreadySent = await db.Notifications.AnyAsync(n =>
                n.UserId == item.PlanningItem.UserId
                && n.RelatedEventId == item.Event.Id
                && n.Type == "EVENT_24H_BEFORE"
                && n.CreatedAt > now.AddDays(-2));

            if (!alreadySent)
            {
                await notifService.CreateAsync(
                    item.PlanningItem.UserId,
                    "EVENT_24H_BEFORE",
                    "Rappel 24h avant",
                    $"N oublie pas : {item.PlanningItem.Title} demain a {item.Event.StartDateTime:HH:mm}",
                    eventId: item.Event.Id);
            }
        }
    }
}