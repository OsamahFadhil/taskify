namespace Taskly.Domain.Tasks.ValueObjects;

public sealed record DueDate
{
    private DueDate(DateTime? value) => Value = value;
    public DateTime? Value { get; }
    public static DueDate Create(DateTime? value) => new(value);
}

