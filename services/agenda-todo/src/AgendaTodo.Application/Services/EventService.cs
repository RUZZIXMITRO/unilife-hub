using AgendaTodo.Application.DTOs;
using AgendaTodo.Application.Interfaces;
using AgendaTodo.Application.Interfaces.Repositories;
using AgendaTodo.Domain.Entities;

namespace AgendaTodo.Application.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _repository;
    private readonly INotificationService _notificationService;

    public EventService(IEventRepository repository, INotificationService notificationService)
    {
        _repository = repository;
        _notificationService = notificationService;
    }

    public async Task<EventDto?> GetByIdAsync(int id)
    {
        var ev = await _repository.GetByIdAsync(id);
        return ev == null ? null : MapToDto(ev);
    }

    public async Task<IEnumerable<EventDto>> GetUserEventsAsync(int userId)
    {
        var events = await _repository.GetByUserIdAsync(userId);
        return events.Select(MapToDto);
    }

    public async Task<IEnumerable<EventDto>> GetByDateRangeAsync(int userId, DateTime start, DateTime end)
    {
        var events = await _repository.GetByDateRangeAsync(userId, start, end);
        return events.Select(MapToDto);
    }

    public async Task<EventDto> CreateAsync(int userId, CreateEventDto dto)
    {
        if (dto.EndDateTime <= dto.StartDateTime)
            throw new ArgumentException("La date de fin doit etre posterieure a la date de debut");

        var ev = new Event
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            EventType = dto.EventType,
            StartDateTime = dto.StartDateTime,
            EndDateTime = dto.EndDateTime,
            Location = dto.Location,
            HasReminder = dto.HasReminder
        };

        if (dto.HasReminder && dto.ReminderMinutesBefore.HasValue)
        {
            ev.Reminders.Add(new EventReminder
            {
                ReminderType = "in-app",
                ReminderTime = dto.StartDateTime.AddMinutes(-dto.ReminderMinutesBefore.Value),
                IsSent = false
            });
        }

        var created = await _repository.AddAsync(ev);
        return MapToDto(created);
    }

    public async Task<EventDto?> UpdateAsync(int id, int userId, CreateEventDto dto)
    {
        var ev = await _repository.GetByIdAsync(id);
        if (ev == null || ev.UserId != userId) return null;

        ev.Title = dto.Title;
        ev.Description = dto.Description;
        ev.EventType = dto.EventType;
        ev.StartDateTime = dto.StartDateTime;
        ev.EndDateTime = dto.EndDateTime;
        ev.Location = dto.Location;
        ev.HasReminder = dto.HasReminder;

        await _repository.UpdateAsync(ev);
        return MapToDto(ev);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var ev = await _repository.GetByIdAsync(id);
        if (ev == null || ev.UserId != userId) return false;

        var title = ev.Title;
        await _repository.DeleteAsync(id);

        // Notification de suppression
        await _notificationService.CreateAsync(
            userId,
            "EVENT_DELETED",
            "Evenement supprime",
            $"L evenement '{title}' a ete supprime");

        return true;
    }

    private static EventDto MapToDto(Event ev) => new()
    {
        Id = ev.Id,
        UserId = ev.UserId,
        Title = ev.Title,
        Description = ev.Description,
        EventType = ev.EventType.ToString(),
        StartDateTime = ev.StartDateTime,
        EndDateTime = ev.EndDateTime,
        Location = ev.Location,
        HasReminder = ev.HasReminder,
        CreatedAt = ev.CreatedAt
    };
}