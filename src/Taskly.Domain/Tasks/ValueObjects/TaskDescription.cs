namespace Taskly.Domain.Tasks.ValueObjects;

public sealed class TaskDescription
{
    private TaskDescription(string? value) => Value = value?.Trim();
    public string? Value { get; }
    public static TaskDescription Create(string? value)
        => value is null ? new TaskDescription(null)
                         : value.Length > 1000 ? throw new ArgumentException("Description too long")
                         : new TaskDescription(value);
    public override string ToString() => Value ?? string.Empty;
}
