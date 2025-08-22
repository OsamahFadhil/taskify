using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(x => x.Id);
        // Don't auto-generate ID since we're providing it in the domain
        b.Property(x => x.Id).IsRequired();
        b.Property(x => x.CreatedAt).IsRequired();
        b.Property(x => x.UpdatedAt).IsRequired();

        b.OwnsOne(x => x.Username, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("username").HasMaxLength(50).IsRequired();
            nb.HasIndex(p => p.Value).IsUnique();
        });
        b.OwnsOne(x => x.Email, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("email").HasMaxLength(256).IsRequired();
            nb.HasIndex(p => p.Value).IsUnique();
        });
        b.OwnsOne(x => x.PasswordHash, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("password_hash").IsRequired();
        });
    }
}

