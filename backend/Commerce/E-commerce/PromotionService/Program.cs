using Microsoft.EntityFrameworkCore;
using PromotionService.Data;
using PromotionService.Repositories.Implementations;
using PromotionService.Repositories.Interfaces;
using PromotionService.Services.Implementations;
using PromotionService.Services.Interfaces;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<PromotionDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IPromotionRepository, PromotionRepository>();
builder.Services.AddScoped<IPromotionService, PromotionServiceImpl>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "UniLife Hub - Promotion Service",
        Description = "Microservice codes promo et remises",
        Version = "v1"
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PromotionDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseRouting();
app.UseHttpMetrics();
app.MapControllers();
app.MapMetrics();

app.Run();