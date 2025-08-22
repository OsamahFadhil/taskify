using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;

namespace Taskly.Domain.Specifications;

public sealed class TaskByFiltersSpec : Specification<TaskItem>
{
    public TaskByFiltersSpec(Guid userId, bool? completed, DateTime? dueOnOrBefore, int? skip, int? take)
    {
        Criteria = t =>
            t.UserId == userId
            && (!completed.HasValue || t.IsCompleted == completed)
            && (!dueOnOrBefore.HasValue || (t.DueDate.Value.HasValue && t.DueDate.Value <= dueOnOrBefore));

        ApplyOrderBy(t => t.CreatedAt, desc: true);
        if (skip.HasValue && take.HasValue) ApplyPaging(skip.Value, take.Value);
    }
}

