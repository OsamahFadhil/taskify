namespace Taskly.Application.Abstractions;

public interface ICurrentUser
{
    Guid? UserId { get; }
}

