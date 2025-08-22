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
        Console.WriteLine($"🔍 Login attempt for: {request.UsernameOrEmail}");
        Console.WriteLine($"🔍 Password length: {request.Password?.Length ?? 0}");

        // First, let's check if there are any users in the database
        var allUsers = await _users.Query(new AlwaysTrueSpec<User>()).ToListAsync(ct);
        Console.WriteLine($"🔍 Total users in database: {allUsers.Count}");
        foreach (var u in allUsers)
        {
            Console.WriteLine($"  - User: {u.Username.Value} ({u.Email.Value}) - ID: {u.Id}");
        }

        var user = await _users.Query(new UsernameOrEmailSpec(request.UsernameOrEmail)).FirstOrDefaultAsync(ct);

        if (user is null)
        {
            Console.WriteLine($"❌ User not found with username/email: {request.UsernameOrEmail}");
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        Console.WriteLine($"✅ User found: {user.Username.Value} ({user.Email.Value})");
        Console.WriteLine($"🔍 User ID: {user.Id}");
        Console.WriteLine($"🔍 Stored password hash: {user.PasswordHash.Value}");
        Console.WriteLine($"🔍 Verifying password: {request.Password}");

        var passwordValid = _hasher.Verify(request.Password, user.PasswordHash.Value);
        Console.WriteLine($"🔍 Password verification result: {passwordValid}");

        if (!passwordValid)
        {
            Console.WriteLine($"❌ Password verification failed");
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        Console.WriteLine($"✅ Login successful, creating token");
        var result = _jwt.CreateToken(user, _clock.UtcNow);
        Console.WriteLine($"🔍 Token generated successfully. Expires at: {result.ExpiresAtUtc}");
        return result;
    }

    private sealed class UsernameOrEmailSpec : Specification<User>
    {
        public UsernameOrEmailSpec(string usernameOrEmail)
        {
            var searchTerm = usernameOrEmail.Trim().ToLowerInvariant();
            Console.WriteLine($"🔍 Searching for user with term: '{searchTerm}'");
            Criteria = u => u.Username.Value == searchTerm || u.Email.Value == searchTerm;
        }
    }

    private sealed class AlwaysTrueSpec<T> : Specification<T>
    {
        public AlwaysTrueSpec() { Criteria = _ => true; }
    }
}
