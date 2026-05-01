using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Repositories.Implementations;
using PaymentService.Repositories.Interfaces;
using PaymentService.Services.Implementations;
using PaymentService.Services.Interfaces;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// SQL Server
builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// HTTP Client
builder.Services.AddHttpClient();

// Dependency Injection (SOLID - D)
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPaymentService, PaymentServiceImpl>();

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "UniLife Hub - Payment Service",
        Description = "Microservice paiement avec Stripe",
        Version = "v1"
    });
    c.AddSecurityDefinition("X-User-Id", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "X-User-Id",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "ID utilisateur injecte par Gateway"
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

// Creer DB et tables automatiquement
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseRouting();
app.UseHttpMetrics();
app.MapControllers();
app.MapMetrics();

app.Run();