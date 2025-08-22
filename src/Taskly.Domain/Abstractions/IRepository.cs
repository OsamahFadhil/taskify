using System.Linq.Expressions;

namespace Taskly.Domain.Abstractions;

public interface IRepository<TAggregate> where TAggregate : AggregateRoot
{
    Task<TAggregate?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(TAggregate entity, CancellationToken ct = default);
    Task RemoveAsync(TAggregate entity, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    IQueryable<TAggregate> Query(ISpecification<TAggregate> spec);
}

