namespace Taskly.Domain.Users.ValueObjects;

public sealed record Email
{
    private Email(string value) => Value = value;
    public string Value { get; }

    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Email is required");
        if (!value.Contains('@') || value.Length > 256) throw new ArgumentException("Invalid email");
        return new Email(value.Trim().ToLowerInvariant());
    }

    public override string ToString() => Value;
}

