namespace Taskly.Domain.Users.ValueObjects;

public sealed record Username
{
    private Username(string value) => Value = value;
    public string Value { get; }

    public static Username Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Username is required");
        if (value.Length < 3) throw new ArgumentException("Username must be at least 3 characters long");
        if (value.Length > 50) throw new ArgumentException("Username must not exceed 50 characters");
        if (!value.All(c => char.IsLetterOrDigit(c) || c == '_' || c == '-'))
            throw new ArgumentException("Username can only contain letters, numbers, underscores, and hyphens");

        return new Username(value.Trim().ToLowerInvariant());
    }

    public override string ToString() => Value;
}
