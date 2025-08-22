namespace Taskly.Application.Features.Tasks.Dtos;

public sealed record TaskDto(
    Guid Id,
    Guid UserId,
    string Username,
    string Name,
    string? Description,
    DateTime? DueDate,
    bool IsCompleted,
    DateTime CreatedAtUtc,
    DateTime? CompletedAtUtc);

