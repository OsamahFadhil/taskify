using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Commands;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Users;

namespace Taskly.Application.Features.Auth;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IRepository<User> _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTime _clock;

    public LoginCommandHandler(IRepository<User> users, IPasswordHasher hasher, IJwtTokenService jwt, IDateTime clock)
    {
        _users = users; _hasher = hasher; _jwt = jwt; _clock = clock;
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _users.Query(new UsernameOrEmailSpec(request.UsernameOrEmail)).FirstOrDefaultAsync(ct);

        if (user is null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var passwordValid = _hasher.Verify(request.Password, user.PasswordHash.Value);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var result = _jwt.CreateToken(user, _clock.UtcNow);
        return result;
    }

    private sealed class UsernameOrEmailSpec : Specification<User>
    {
        public UsernameOrEmailSpec(string usernameOrEmail)
        {
            var searchTerm = usernameOrEmail.Trim().ToLowerInvariant();
            Criteria = u => u.Username.Value == searchTerm || u.Email.Value == searchTerm;
        }
    }

    private sealed class AlwaysTrueSpec<T> : Specification<T>
    {
        public AlwaysTrueSpec() { Criteria = _ => true; }
    }
}
