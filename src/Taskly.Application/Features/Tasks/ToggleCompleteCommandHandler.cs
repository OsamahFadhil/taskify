using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Users;

namespace Taskly.Application.Features.Tasks;

public sealed class ToggleCompleteCommandHandler : IRequestHandler<ToggleCompleteCommand, TaskDto>
{
    private readonly IRepository<TaskItem> _taskRepo;
    private readonly IRepository<User> _userRepo;
    private readonly ICurrentUser _current;
    private readonly IDateTime _clock;

    public ToggleCompleteCommandHandler(IRepository<TaskItem> taskRepo, IRepository<User> userRepo, ICurrentUser current, IDateTime clock)
    {
        _taskRepo = taskRepo;
        _userRepo = userRepo;
        _current = current;
        _clock = clock;
    }

    public async Task<TaskDto> Handle(ToggleCompleteCommand request, CancellationToken ct)
    {
        var task = await _taskRepo.GetByIdAsync(request.Id, ct)
                   ?? throw new KeyNotFoundException("Task not found");

        if (task.UserId != _current.UserId)
            throw new UnauthorizedAccessException();

        task.ToggleComplete(_clock.UtcNow);
        await _taskRepo.SaveChangesAsync(ct);

        // Get user information for the task
        var user = await _userRepo.GetByIdAsync(task.UserId, ct);

        return new TaskDto(
            task.Id,
            task.UserId,
            user?.Username.Value ?? "Unknown User",
            task.Name.Value,
            task.Description.Value,
            task.DueDate.Value,
            task.IsCompleted,
            task.CreatedAt,
            task.CompletedAtUtc);
    }
}

