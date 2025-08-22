using System.Linq.Expressions;

namespace Taskly.Domain.Abstractions;

public interface ISpecification<T>
{
    Expression<Func<T, bool>>? Criteria { get; }
    Func<IQueryable<T>, IOrderedQueryable<T>>? OrderBy { get; }
    int? Skip { get; }
    int? Take { get; }
}

public abstract class Specification<T> : ISpecification<T>
{
    public Expression<Func<T, bool>>? Criteria { get; protected set; }
    public Func<IQueryable<T>, IOrderedQueryable<T>>? OrderBy { get; protected set; }
    public int? Skip { get; protected set; }
    public int? Take { get; protected set; }

    protected void ApplyPaging(int skip, int take) { Skip = skip; Take = take; }
    protected void ApplyOrderBy<TKey>(Expression<Func<T, TKey>> keySelector, bool desc = false)
    {
        OrderBy = q => desc ? q.OrderByDescending(keySelector) : q.OrderBy(keySelector);
    }
}

