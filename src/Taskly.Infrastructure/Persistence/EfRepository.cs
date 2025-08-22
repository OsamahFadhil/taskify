using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;
using Taskly.Infrastructure.Persistence;

namespace Taskly.Infrastructure.Persistence;

public sealed class EfRepository<TAggregate> : IRepository<TAggregate> where TAggregate : AggregateRoot
{
    private readonly AppDbContext _context;

    public EfRepository(AppDbContext context) => _context = context;

    public async Task<TAggregate?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Set<TAggregate>().FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task AddAsync(TAggregate entity, CancellationToken ct = default)
    {
        await _context.Set<TAggregate>().AddAsync(entity, ct);
    }

    public async Task RemoveAsync(TAggregate entity, CancellationToken ct = default)
    {
        _context.Set<TAggregate>().Remove(entity);
        await Task.CompletedTask;
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _context.SaveChangesAsync(ct);

    public IQueryable<TAggregate> Query(ISpecification<TAggregate> spec) =>
        SpecificationEvaluator.GetQuery(_context.Set<TAggregate>(), spec);
}

