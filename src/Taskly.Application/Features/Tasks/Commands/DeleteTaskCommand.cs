using MediatR;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record DeleteTaskCommand(Guid Id) : IRequest;

