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
            Console.WriteLine($"🔍 Registering new user: {request.Username} ({request.Email})");

            // Check for duplicates using efficient database queries
            Console.WriteLine($"🔍 Checking for duplicates: Username='{request.Username}', Email='{request.Email}'");

            // Check for duplicate username - only query for this specific username
            var duplicateUsername = await _userRepository.Query(new UsernameCheckSpec(request.Username))
                .FirstOrDefaultAsync(cancellationToken);

            // Check for duplicate email - only query for this specific email  
            var duplicateEmail = await _userRepository.Query(new EmailCheckSpec(request.Email))
                .FirstOrDefaultAsync(cancellationToken);

            if (duplicateUsername != null || duplicateEmail != null)
            {
                var conflicts = new List<string>();

                if (duplicateUsername != null)
                {
                    conflicts.Add("username");
                    Console.WriteLine($"🔍 Username conflict detected: '{duplicateUsername.Username.Value}' vs '{request.Username}'");
                }

                if (duplicateEmail != null)
                {
                    conflicts.Add("email");
                    Console.WriteLine($"🔍 Email conflict detected: '{duplicateEmail.Email.Value}' vs '{request.Email}'");
                }

                var conflictMessage = conflicts.Count == 1
                    ? $"This {conflicts[0]} is already taken"
                    : $"This {string.Join(" and ", conflicts)} are already taken";

                Console.WriteLine($"🔍 Throwing DuplicateRegistrationException: {conflictMessage}");
                throw new DuplicateRegistrationException($"Registration failed: {conflictMessage}. Please choose different credentials.");
            }

            Console.WriteLine($"🔍 No duplicates found, proceeding with registration");

            var username = Username.Create(request.Username);
            var email = Email.Create(request.Email);
            var passwordHash = PasswordHash.From(_passwordHasher.Hash(request.Password));

            var user = User.Register(username, email, passwordHash, _dateTime.UtcNow);
            Console.WriteLine($"🔍 User entity created with ID: {user.Id}");

            await _userRepository.AddAsync(user, cancellationToken);
            Console.WriteLine($"🔍 User added to repository");

            // CRITICAL: Save changes to persist to database
            var changesSaved = await _userRepository.SaveChangesAsync(cancellationToken);
            Console.WriteLine($"🔍 Changes saved to database. Rows affected: {changesSaved}, User ID: {user.Id}");

            // Verify the user was actually saved by trying to retrieve it
            var savedUser = await _userRepository.GetByIdAsync(user.Id, cancellationToken);
            if (savedUser == null)
            {
                throw new InvalidOperationException($"User was not saved to database. ID: {user.Id}");
            }
            Console.WriteLine($"🔍 User verified in database: {savedUser.Username.Value}");

            return _jwtTokenService.CreateToken(user, _dateTime.UtcNow);
        }
        catch (DuplicateRegistrationException)
        {
            // Re-throw duplicate registration exceptions
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Unexpected error during user registration: {ex.Message}");
            Console.WriteLine($"❌ Stack trace: {ex.StackTrace}");
            throw new InvalidOperationException("Registration failed due to an unexpected error. Please try again later.");
        }
    }

    // Specification to check for specific username
    private sealed class UsernameCheckSpec : Specification<User>
    {
        public UsernameCheckSpec(string username)
        {
            Criteria = u => u.Username.Value.ToLower() == username.ToLower();
        }
    }

    // Specification to check for specific email
    private sealed class EmailCheckSpec : Specification<User>
    {
        public EmailCheckSpec(string email)
        {
            Criteria = u => u.Email.Value.ToLower() == email.ToLower();
        }
    }
}
