using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record ToggleCompleteCommand(Guid Id) : IRequest<TaskDto>;

