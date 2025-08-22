using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Common.Dtos;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Application.Features.Tasks.Queries;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Specifications;
using Taskly.Domain.Tasks;
using Taskly.Domain.Users;

namespace Taskly.Application.Features.Tasks;

public sealed class ListTasksQueryHandler : IRequestHandler<ListTasksQuery, PagedResultDto<TaskDto>>
{
    private readonly IRepository<TaskItem> _repo;
    private readonly IRepository<User> _userRepo;
    private readonly ICurrentUser _current;

    public ListTasksQueryHandler(IRepository<TaskItem> repo, IRepository<User> userRepo, ICurrentUser current)
    { _repo = repo; _userRepo = userRepo; _current = current; }

    public async Task<PagedResultDto<TaskDto>> Handle(ListTasksQuery request, CancellationToken ct)
    {
        var ownerId = _current.UserId ?? throw new UnauthorizedAccessException();

        var skip = (request.Page - 1) * request.PageSize;

        // Debug logging
        Console.WriteLine($"[DEBUG] Pagination: Page={request.Page}, PageSize={request.PageSize}, Skip={skip}");

        // Get total count first
        var countSpec = new TaskByFiltersSpec(ownerId, request.Completed, request.DueOnOrBefore, null, null);
        var totalCount = await _repo.Query(countSpec).CountAsync(ct);

        Console.WriteLine($"[DEBUG] Total count: {totalCount}");

        // Get paginated results
        var dataSpec = new TaskByFiltersSpec(ownerId, request.Completed, request.DueOnOrBefore, skip, request.PageSize);
        var items = await _repo.Query(dataSpec).ToListAsync(ct);

        Console.WriteLine($"[DEBUG] Retrieved items: {items.Count}");

        // Get all unique user IDs from tasks
        var userIds = items.Select(t => t.UserId).Distinct().ToList();
        var userDict = new Dictionary<Guid, string>();

        foreach (var userId in userIds)
        {
            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user != null)
            {
                userDict[userId] = user.Username.Value;
            }
        }

        var taskDtos = items.Select(t => new TaskDto(
            t.Id,
            t.UserId,
            userDict.GetValueOrDefault(t.UserId, "Unknown User"),
            t.Name.Value,
            t.Description.Value,
            t.DueDate.Value,
            t.IsCompleted,
            t.CreatedAt,
            t.CompletedAtUtc)).ToList();

        var result = PagedResultDto<TaskDto>.Create(taskDtos, totalCount, request.Page, request.PageSize);
        Console.WriteLine($"[DEBUG] Result: Page={result.Page}, TotalPages={result.TotalPages}, ItemsCount={result.Items.Count}");

        return result;
    }
}
