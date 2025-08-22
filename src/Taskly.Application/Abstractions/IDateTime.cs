namespace Taskly.Application.Abstractions;

public interface IDateTime
{
    DateTime UtcNow { get; }
}

