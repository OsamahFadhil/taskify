namespace Taskly.Domain.Abstractions;

public abstract record DomainEvent(DateTime OccurredOnUtc);

