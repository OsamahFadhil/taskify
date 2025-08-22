using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Users;

namespace Taskly.Application.Abstractions;

public interface IJwtTokenService
{
    AuthResultDto CreateToken(User user, DateTime nowUtc);
}

