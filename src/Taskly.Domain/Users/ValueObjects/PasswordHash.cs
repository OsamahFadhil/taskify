namespace Taskly.Domain.Users.ValueObjects;

public sealed record PasswordHash
{
    private PasswordHash(string value) => Value = value;
    public string Value { get; }
    public static PasswordHash From(string hash) =>
        string.IsNullOrWhiteSpace(hash) ? throw new ArgumentException("Hash required") : new PasswordHash(hash);
    public override string ToString() => Value;
}

