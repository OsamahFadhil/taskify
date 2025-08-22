namespace Taskly.Application.Common.Dtos;

public sealed record PagedResultDto<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages,
    bool HasNextPage,
    bool HasPreviousPage
)
{
    public static PagedResultDto<T> Create(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        var hasNextPage = page < totalPages;
        var hasPreviousPage = page > 1;

        return new PagedResultDto<T>(items, totalCount, page, pageSize, totalPages, hasNextPage, hasPreviousPage);
    }
}

