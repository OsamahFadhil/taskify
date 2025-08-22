using Taskly.Domain.Abstractions;

namespace Taskly.Domain.Tasks.Events;

public sealed record TaskCompletionToggledDomainEvent(Guid TaskId, bool IsCompleted)
    : DomainEvent(DateTime.UtcNow);

