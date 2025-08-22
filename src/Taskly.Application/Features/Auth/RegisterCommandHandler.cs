using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Commands;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Application.Common.Exceptions;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Users;
using Taskly.Domain.Users.ValueObjects;

namespace Taskly.Application.Features.Auth;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResultDto>
{
    private readonly IRepository<User> _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTime _dateTime;

    public RegisterCommandHandler(IRepository<User> userRepository, IJwtTokenService jwtTokenService, IPasswordHasher passwordHasher, IDateTime dateTime)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _dateTime = dateTime;
    }

    public async Task<AuthResultDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var duplicateUsername = await _userRepository.Query(new UsernameCheckSpec(request.Username))
                .FirstOrDefaultAsync(cancellationToken);

            var duplicateEmail = await _userRepository.Query(new EmailCheckSpec(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            if (duplicateUsername != null || duplicateEmail != null)
            {
                var conflicts = new List<string>();

                if (duplicateUsername != null)
                {
                    conflicts.Add("username");
                }

                if (duplicateEmail != null)
                {
                    conflicts.Add("email");
                }

                var conflictMessage = conflicts.Count == 1
                    ? $"This {conflicts[0]} is already taken"
                    : $"This {string.Join(" and ", conflicts)} are already taken";

                throw new DuplicateRegistrationException($"Registration failed: {conflictMessage}. Please choose different credentials.");
            }

            var username = Username.Create(request.Username);
            var email = Email.Create(request.Email);
            var passwordHash = PasswordHash.From(_passwordHasher.Hash(request.Password));

            var user = User.Register(username, email, passwordHash, _dateTime.UtcNow);

            await _userRepository.AddAsync(user, cancellationToken);

            var changesSaved = await _userRepository.SaveChangesAsync(cancellationToken);

            var savedUser = await _userRepository.GetByIdAsync(user.Id, cancellationToken);
            if (savedUser == null)
            {
                throw new InvalidOperationException($"User was not saved to database. ID: {user.Id}");
            }

            return _jwtTokenService.CreateToken(user, _dateTime.UtcNow);
        }
        catch (DuplicateRegistrationException)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Registration failed due to an unexpected error. Please try again later.");
        }
    }

    private sealed class UsernameCheckSpec : Specification<User>
    {
        public UsernameCheckSpec(string username)
        {
            Criteria = u => u.Username.Value.ToLower() == username.ToLower();
        }
    }

    private sealed class EmailCheckSpec : Specification<User>
    {
        public EmailCheckSpec(string email)
        {
            Criteria = u => u.Email.Value.ToLower() == email.ToLower();
        }
    }
}
