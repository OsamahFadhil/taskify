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
        b.Property(x => x.Id).ValueGeneratedOnAdd();
        b.Property(x => x.UserId).IsRequired();
        b.Property(x => x.IsCompleted).IsRequired();
        b.Property(x => x.CreatedAt).IsRequired();
        b.Property(x => x.UpdatedAt).IsRequired();
        b.Property(x => x.CompletedAtUtc);

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
            nb.Property(p => p.Value).HasColumnName("due_date");
        });

        b.HasIndex(x => new { x.UserId, x.IsCompleted });
    }
}

