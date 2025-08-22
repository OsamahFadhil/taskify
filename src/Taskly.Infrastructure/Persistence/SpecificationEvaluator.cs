using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;

namespace Taskly.Infrastructure.Persistence;

public static class SpecificationEvaluator
{
    public static IQueryable<T> GetQuery<T>(IQueryable<T> input, ISpecification<T> spec) where T : class
    {
        var query = input;
        if (spec.Criteria is not null) query = query.Where(spec.Criteria);
        if (spec.OrderBy is not null) query = spec.OrderBy(query);
        if (spec.Skip.HasValue)
        {
            Console.WriteLine($"[DEBUG] Applying Skip: {spec.Skip.Value}");
            query = query.Skip(spec.Skip.Value);
        }
        if (spec.Take.HasValue)
        {
            Console.WriteLine($"[DEBUG] Applying Take: {spec.Take.Value}");
            query = query.Take(spec.Take.Value);
        }
        return query.AsNoTracking();
    }
}
