using AgendaTodo.Application.DTOs;
using AgendaTodo.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaTodo.API.Controllers;

[ApiController]
[Route("api/agenda/events")]
// [Authorize] DESACTIVE temporairement pour tests sans JWT
public class EventsController : ControllerBase
{
    private readonly IEventService _service;
    private readonly ILogger<EventsController> _logger;

    public EventsController(IEventService service, ILogger<EventsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // TEMPORAIRE : retourne un ID fixe pour tester sans JWT
    private int GetUserId()
    {
        return 1;
    }

    // GET /api/agenda/events
    [HttpGet]
    public async Task<IActionResult> GetMyEvents()
    {
        var userId = GetUserId();
        _logger.LogInformation("User {UserId} recupere ses evenements", userId);
        var events = await _service.GetUserEventsAsync(userId);
        return Ok(events);
    }

    // GET /api/agenda/events/calendar?view=weekly&date=2024-02-12
    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar([FromQuery] string view, [FromQuery] DateTime date)
    {
        var userId = GetUserId();

        var (start, end) = view.ToLower() switch
        {
            "daily" => (date.Date, date.Date.AddDays(1)),
            "weekly" => (date.Date, date.Date.AddDays(7)),
            "monthly" => (new DateTime(date.Year, date.Month, 1),
                          new DateTime(date.Year, date.Month, 1).AddMonths(1)),
            _ => throw new ArgumentException("Vue invalide. Utilisez: daily, weekly, monthly")
        };

        var events = await _service.GetByDateRangeAsync(userId, start, end);
        return Ok(events);
    }

    // GET /api/agenda/events/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ev = await _service.GetByIdAsync(id);
        if (ev == null) return NotFound();
        return Ok(ev);
    }

    // POST /api/agenda/events
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventDto dto)
    {
        var userId = GetUserId();
        try
        {
            var created = await _service.CreateAsync(userId, dto);
            _logger.LogInformation("Evenement cree: {Id} par user {UserId}", created.Id, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT /api/agenda/events/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateEventDto dto)
    {
        var userId = GetUserId();
        var updated = await _service.UpdateAsync(id, userId, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    // DELETE /api/agenda/events/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var deleted = await _service.DeleteAsync(id, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }
}