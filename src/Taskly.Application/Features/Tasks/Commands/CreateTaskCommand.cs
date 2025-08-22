using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record CreateTaskCommand(string Name, string? Description, DateTime? DueDate) : IRequest<TaskDto>;

