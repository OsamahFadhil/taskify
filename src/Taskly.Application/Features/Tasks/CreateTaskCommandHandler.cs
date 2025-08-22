using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;
using Taskly.Domain.Users;

namespace Taskly.Application.Features.Tasks;

public sealed class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IRepository<TaskItem> _repo;
    private readonly IRepository<User> _userRepo;
    private readonly ICurrentUser _current;
    private readonly IDateTime _clock;

    public CreateTaskCommandHandler(IRepository<TaskItem> repo, IRepository<User> userRepo, ICurrentUser current, IDateTime clock)
    { _repo = repo; _userRepo = userRepo; _current = current; _clock = clock; }

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken ct)
    {
        var ownerId = _current.UserId ?? throw new UnauthorizedAccessException();
        // Convert dueDate to UTC if it has a value to avoid PostgreSQL DateTime Kind errors
        var utcDueDate = request.DueDate?.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc)
            : request.DueDate?.ToUniversalTime();

        var task = TaskItem.Create(ownerId,
            TaskName.Create(request.Name),
            TaskDescription.Create(request.Description),
            DueDate.Create(utcDueDate),
            _clock.UtcNow);

        await _repo.AddAsync(task, ct);
        await _repo.SaveChangesAsync(ct);

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

