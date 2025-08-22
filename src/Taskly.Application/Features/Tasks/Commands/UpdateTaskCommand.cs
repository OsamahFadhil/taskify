using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record UpdateTaskCommand(string Name, string? Description, DateTime? DueDate) : IRequest<TaskDto>;

public sealed record UpdateTaskCommandWithId(Guid Id, string Name, string? Description, DateTime? DueDate) : IRequest<TaskDto>;
