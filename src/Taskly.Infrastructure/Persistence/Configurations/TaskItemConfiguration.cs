using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Taskly.Domain.Tasks;

namespace Taskly.Infrastructure.Persistence.Configurations;

public sealed class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> b)
    {
        b.ToTable("tasks");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).IsRequired();
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.IsCompleted).IsRequired();

        // Configure DateTime properties to be stored as UTC
        b.Property(x => x.CreatedAt)
            .IsRequired()
            .HasConversion(
                v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v,
                v => v
            );

        b.Property(x => x.UpdatedAt)
            .IsRequired()
            .HasConversion(
                v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v,
                v => v
            );

        b.Property(x => x.CompletedAtUtc)
            .HasConversion(
                v => v.HasValue && v.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v,
                v => v
            );

        b.OwnsOne(x => x.Name, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("name").HasMaxLength(120).IsRequired();
        });
        b.OwnsOne(x => x.Description, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("description").HasMaxLength(1000);
        });
        b.OwnsOne(x => x.DueDate, nb =>
        {
            nb.Property(p => p.Value)
                .HasColumnName("due_date")
                .HasConversion(
                    v => v.HasValue && v.Value.Kind == DateTimeKind.Unspecified
                        ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                        : v,
                    v => v
                );
        });

        b.HasIndex(x => new { x.UserId, x.IsCompleted });
    }
}

