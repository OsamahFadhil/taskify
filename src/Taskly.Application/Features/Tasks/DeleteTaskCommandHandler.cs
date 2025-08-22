using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;

namespace Taskly.Application.Features.Tasks;

public sealed class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly IRepository<TaskItem> _repo;
    private readonly ICurrentUser _current;

    public DeleteTaskCommandHandler(IRepository<TaskItem> repo, ICurrentUser current)
    { _repo = repo; _current = current; }

    public async Task Handle(DeleteTaskCommand request, CancellationToken ct)
    {
        var task = await _repo.GetByIdAsync(request.Id, ct)
                   ?? throw new KeyNotFoundException("Task not found");

        if (task.UserId != _current.UserId) throw new UnauthorizedAccessException();

        await _repo.RemoveAsync(task, ct);
        await _repo.SaveChangesAsync(ct);
    }
}

