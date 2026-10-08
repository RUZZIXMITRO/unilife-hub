using AgendaTodo.Application.DTOs;
using AgendaTodo.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaTodo.API.Controllers;

[ApiController]
[Route("api/todo/tasks")]
// [Authorize] DESACTIVE temporairement pour tests sans JWT
public class TodosController : ControllerBase
{
    private readonly ITodoService _service;
    private readonly ILogger<TodosController> _logger;

    public TodosController(ITodoService service, ILogger<TodosController> logger)
    {
        _service = service;
        _logger = logger;
    }

    // TEMPORAIRE : retourne un ID fixe pour tester sans JWT
    private int GetUserId()
    {
        return 1;
    }

    // GET /api/todo/tasks
    [HttpGet]
    public async Task<IActionResult> GetMyTodos()
    {
        var userId = GetUserId();
        var todos = await _service.GetUserTodosAsync(userId);
        return Ok(todos);
    }

    // GET /api/todo/tasks/overdue
    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue()
    {
        var userId = GetUserId();
        var todos = await _service.GetOverdueAsync(userId);
        return Ok(todos);
    }

    // GET /api/todo/tasks/pending
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var userId = GetUserId();
        var todos = await _service.GetPendingAsync(userId);
        return Ok(todos);
    }

    // GET /api/todo/tasks/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var todo = await _service.GetByIdAsync(id);
        if (todo == null) return NotFound();
        return Ok(todo);
    }

    // POST /api/todo/tasks
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoDto dto)
    {
        var userId = GetUserId();
        var created = await _service.CreateAsync(userId, dto);
        _logger.LogInformation("Tache creee: {Id} par user {UserId}", created.Id, userId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/todo/tasks/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateTodoDto dto)
    {
        var userId = GetUserId();
        var updated = await _service.UpdateAsync(id, userId, dto);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    // PATCH /api/todo/tasks/{id}/complete
    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> MarkAsCompleted(int id)
    {
        var userId = GetUserId();
        var completed = await _service.MarkAsCompletedAsync(id, userId);
        if (completed == null) return NotFound();
        _logger.LogInformation("Tache {Id} marquee terminee par user {UserId}", id, userId);
        return Ok(completed);
    }

    // DELETE /api/todo/tasks/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var deleted = await _service.DeleteAsync(id, userId);
        if (!deleted) return NotFound();
        return NoContent();
    }
}