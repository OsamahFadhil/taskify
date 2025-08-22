namespace Taskly.Domain.Tasks.ValueObjects;

public sealed record TaskName
{
    private TaskName(string value) => Value = value;
    public string Value { get; }
    public static TaskName Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Task name is required");
        if (value.Length > 120) throw new ArgumentException("Task name max length is 120");
        return new TaskName(value.Trim());
    }
    public override string ToString() => Value;
}

