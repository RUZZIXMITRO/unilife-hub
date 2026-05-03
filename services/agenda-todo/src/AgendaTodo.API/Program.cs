using System.Text;
using System.Text.Json.Serialization;
using AgendaTodo.API.BackgroundServices;
using AgendaTodo.Application.Interfaces;
using AgendaTodo.Application.Interfaces.Repositories;
using AgendaTodo.Application.Services;
using AgendaTodo.Application.Validators;
using AgendaTodo.Infrastructure.Data;
using AgendaTodo.Infrastructure.Repositories;
using AgendaTodo.Infrastructure.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/agenda-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();
builder.Host.UseSerilog();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AgendaTodoDbContext>(options =>
    options.UseSqlServer(connectionString,
        b => b.MigrationsAssembly("AgendaTodo.Infrastructure")));

// REPOSITORIES
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<ITodoRepository, TodoRepository>();

// SERVICES METIER
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<ITodoService, TodoService>();

// SERVICE NOTIFICATIONS (interne)
builder.Services.AddScoped<INotificationService, NotificationService>();

// BACKGROUND SERVICES (Cron Jobs)
builder.Services.AddHostedService<EventReminderBackgroundService>();
builder.Services.AddHostedService<DailyReminderBackgroundService>();
builder.Services.AddHostedService<OverdueTaskBackgroundService>();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateEventValidator>();

// JWT - aligne UniLifeHub
var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AgendaTodoService API",
        Version = "v1",
        Description = "Microservice Agenda et To-Do pour UniLife Hub avec notifications internes"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AgendaTodoDbContext>();
        db.Database.Migrate();
        Log.Information("Migrations appliquees avec succes");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Erreur lors des migrations");
    }
}

app.Run();