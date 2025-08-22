using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // gather domain events before save
        var domainEntities = ChangeTracker.Entries<Entity>()
            .Where(e => e.Entity is not null && e.Entity.DomainEvents.Any())
            .ToList();

        var events = new List<DomainEvent>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Entity entity && entity.DomainEvents.Any())
            {
                events.AddRange(entity.DomainEvents);
                entity.ClearDomainEvents();
            }
        }

        var result = await base.SaveChangesAsync(ct);

        // dispatch events here if you have handlers (MediatR notifications etc.)
        // (left as hook; you can integrate MediatR notifications by mapping DomainEvent -> INotification)
        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Exclude DomainEvent from being mapped as an entity
        modelBuilder.Ignore<DomainEvent>();

        // Configure all DateTime properties to be stored as UTC
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(
                        new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                            v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v,
                            v => v
                        )
                    );
                }
            }
        }

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
