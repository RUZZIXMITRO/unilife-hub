using Microsoft.AspNetCore.Mvc;
using PromotionService.DTOs.Requests;
using PromotionService.DTOs.Responses;
using PromotionService.Services.Interfaces;

namespace PromotionService.Controllers;

[ApiController]
[Route("api/promotions")]
public class PromotionController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PromotionResponse>>> Create(
        [FromBody] CreatePromotionRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _promotionService.CreatePromotionAsync(request);
        return result.Success ? StatusCode(201, result) : BadRequest(result);
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PromotionResponse>>>> GetAll()
    {
        return Ok(await _promotionService.GetAllPromotionsAsync());
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<List<PromotionResponse>>>> GetActive()
    {
        return Ok(await _promotionService.GetActivePromotionsAsync());
    }

    [HttpPost("apply")]
    public async Task<ActionResult<ApiResponse<ApplyPromoResponse>>> Apply(
        [FromBody] ApplyPromoRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _promotionService.ApplyPromoCodeAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("use")]
    public async Task<ActionResult<ApiResponse<ApplyPromoResponse>>> Use(
        [FromBody] UsePromoRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _promotionService.UsePromoCodeAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Deactivate(int id)
    {
        var result = await _promotionService.DeactivatePromotionAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }
}