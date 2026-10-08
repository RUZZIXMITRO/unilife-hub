using CartService.Data;
using CartService.Repositories.Implementations;
using CartService.Repositories.Interfaces;
using CartService.Services.Implementations;
using CartService.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// ── SQL Server ──────────────────────────────────────────────────
builder.Services.AddDbContext<CartDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Redis Cache ─────────────────────────────────────────────────
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
    options.InstanceName = "CartService_";
});

// ── HTTP Client pour appels inter-services ──────────────────────
builder.Services.AddHttpClient();

// ── Dependency Injection (SOLID - D) ────────────────────────────
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartService, CartServiceImpl>();

// ── Controllers + Swagger ───────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "UniLife Hub - Cart Service",
        Description = "Microservice panier e-commerce — SQL Server + Redis",
        Version = "v1"
    });

    // Ajouter le header X-User-Id
    c.AddSecurityDefinition("X-User-Id", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "X-User-Id",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "ID de l utilisateur injecte par le Gateway"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "X-User-Id"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Migration automatique (comme EF dans AuthService) ───────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CartDbContext>();
    db.Database.EnsureCreated();
}

// ── Middleware ──────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI();
app.UseRouting();
app.UseHttpMetrics();
app.MapControllers();
app.MapMetrics();

app.Run();