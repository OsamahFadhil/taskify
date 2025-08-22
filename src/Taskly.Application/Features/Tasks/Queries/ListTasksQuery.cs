using MediatR;
using Taskly.Application.Common.Dtos;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Queries;

public sealed record ListTasksQuery(bool? Completed, DateTime? DueOnOrBefore, int Page = 1, int PageSize = 20)
    : IRequest<PagedResultDto<TaskDto>>;
