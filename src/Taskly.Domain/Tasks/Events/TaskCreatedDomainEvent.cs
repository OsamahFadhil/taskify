using Taskly.Domain.Abstractions;

namespace Taskly.Domain.Tasks.Events;

public sealed record TaskCreatedDomainEvent(Guid UserId, Guid TaskId, string Name)
    : DomainEvent(DateTime.UtcNow);

