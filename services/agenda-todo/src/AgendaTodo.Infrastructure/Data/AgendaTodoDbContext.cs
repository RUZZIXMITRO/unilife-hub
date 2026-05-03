using AgendaTodo.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgendaTodo.Infrastructure.Data;

public class AgendaTodoDbContext : DbContext
{
    public AgendaTodoDbContext(DbContextOptions<AgendaTodoDbContext> options)
        : base(options) { }

    public DbSet<Event> Events => Set<Event>();
    public DbSet<Todo> Todos => Set<Todo>();
    public DbSet<EventReminder> EventReminders => Set<EventReminder>();
    public DbSet<TodoReminder> TodoReminders => Set<TodoReminder>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Heritage TPT
        modelBuilder.Entity<PlanningItem>().ToTable("planning_items");
        modelBuilder.Entity<Event>().ToTable("events");
        modelBuilder.Entity<Todo>().ToTable("todos");

        modelBuilder.Entity<PlanningItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasColumnType("NVARCHAR(MAX)");
            entity.Property(e => e.UserId).IsRequired();
            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<Event>(entity =>
        {
            entity.Property(e => e.EventType)
                  .HasConversion<string>()
                  .HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(255);
            entity.HasIndex(e => e.StartDateTime);
        });

        modelBuilder.Entity<Todo>(entity =>
        {
            entity.Property(e => e.Priority)
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.HasIndex(e => e.DueDate);
            entity.HasIndex(e => e.IsCompleted);
        });

        modelBuilder.Entity<EventReminder>(entity =>
        {
            entity.ToTable("event_reminders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReminderType).IsRequired().HasMaxLength(50);

            entity.HasOne(e => e.Event)
                  .WithMany(ev => ev.Reminders)
                  .HasForeignKey(e => e.EventId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TodoReminder>(entity =>
        {
            entity.ToTable("todo_reminders");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReminderType).IsRequired().HasMaxLength(50);

            entity.HasOne(e => e.Todo)
                  .WithMany(t => t.Reminders)
                  .HasForeignKey(e => e.TodoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // NOUVEAU : Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Message).HasColumnType("NVARCHAR(MAX)");
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsRead);
            entity.HasIndex(e => e.CreatedAt);
        });
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries<PlanningItem>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
                entry.Entity.CreatedAt = DateTime.UtcNow;
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}