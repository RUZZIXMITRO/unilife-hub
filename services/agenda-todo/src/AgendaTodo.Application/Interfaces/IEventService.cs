using AgendaTodo.Application.DTOs;

namespace AgendaTodo.Application.Interfaces;

public interface IEventService
{
    Task<EventDto?> GetByIdAsync(int id);
    Task<IEnumerable<EventDto>> GetUserEventsAsync(int userId);
    Task<IEnumerable<EventDto>> GetByDateRangeAsync(int userId, DateTime start, DateTime end);
    Task<EventDto> CreateAsync(int userId, CreateEventDto dto);
    Task<EventDto?> UpdateAsync(int id, int userId, CreateEventDto dto);
    Task<bool> DeleteAsync(int id, int userId);
}