using Taskly.Domain.Abstractions;
using Taskly.Domain.Users.ValueObjects;

namespace Taskly.Domain.Users;

public sealed class User : AggregateRoot
{
    private User() { } // EF
    public Username Username { get; private set; } = null!;
    public Email Email { get; private set; } = null!;
    public PasswordHash PasswordHash { get; private set; } = null!;

    private User(Guid id, Username username, Email email, PasswordHash passwordHash, DateTime nowUtc)
    {
        Id = id;
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        CreatedAt = nowUtc;
        UpdatedAt = nowUtc;
    }

    public static User Register(Username username, Email email, PasswordHash passwordHash, DateTime nowUtc)
        => new(Guid.NewGuid(), username, email, passwordHash, nowUtc);

    // Static method for seeding with specific ID
    public static User Seed(Guid id, Username username, Email email, PasswordHash passwordHash, DateTime nowUtc)
        => new(id, username, email, passwordHash, nowUtc);
}

