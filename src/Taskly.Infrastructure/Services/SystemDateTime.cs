using Taskly.Application.Abstractions;

namespace Taskly.Infrastructure.Services;

public sealed class SystemDateTime : IDateTime
{
    public DateTime UtcNow => DateTime.UtcNow;
}

