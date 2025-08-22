using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks.Events;
using Taskly.Domain.Tasks.ValueObjects;

namespace Taskly.Domain.Tasks;

public sealed class TaskItem : AggregateRoot
{
    private TaskItem() { } // EF

    public Guid UserId { get; private set; }
    public TaskName Name { get; private set; } = null!;
    public TaskDescription Description { get; private set; } = null!;
    public DueDate DueDate { get; private set; } = null!;
    public bool IsCompleted { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }

    private TaskItem(Guid id, Guid userId, TaskName name, TaskDescription description, DueDate dueDate, DateTime nowUtc)
    {
        Id = id;
        UserId = userId;
        Name = name;
        Description = description;
        DueDate = dueDate;
        CreatedAt = nowUtc;
        UpdatedAt = nowUtc;
        IsCompleted = false;

        Raise(new TaskCreatedDomainEvent(UserId, Id, Name.Value));
    }

    public static TaskItem Create(Guid userId, TaskName name, TaskDescription description, DueDate dueDate, DateTime nowUtc)
        => new(Guid.Empty, userId, name, description, dueDate, nowUtc);

    public void Update(TaskName name, TaskDescription description, DueDate dueDate)
    {
        Name = name;
        Description = description;
        DueDate = dueDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ToggleComplete(DateTime nowUtc)
    {
        IsCompleted = !IsCompleted;
        CompletedAtUtc = IsCompleted ? nowUtc : null;
        UpdatedAt = nowUtc;
        Raise(new TaskCompletionToggledDomainEvent(Id, IsCompleted));
    }
}
