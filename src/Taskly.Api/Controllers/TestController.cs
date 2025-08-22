using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Commands;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Users;
using Taskly.Domain.Users.ValueObjects;
using Taskly.Infrastructure.Persistence;
using MediatR;

namespace Taskly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly IMediator _mediator;

    public TestController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Auto-login with seeded user for testing
    /// </summary>
    [HttpGet("auto-login")]
    public async Task<ActionResult<AuthResultDto>> AutoLogin(CancellationToken ct)
    {
        // Login with the seeded user
        var loginCommand = new LoginCommand("john@example.com", "password123");

        var result = await _mediator.Send(loginCommand, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get a test token for Swagger
    /// </summary>
    [HttpGet("token")]
    public async Task<ActionResult<string>> GetTestToken(CancellationToken ct)
    {
        var loginCommand = new LoginCommand("john@example.com", "password123");

        var result = await _mediator.Send(loginCommand, ct);
        return Ok(result.AccessToken);
    }

    /// <summary>
    /// Test JWT validation without authentication
    /// </summary>
    [HttpGet("validate-jwt")]
    [AllowAnonymous]
    public ActionResult<string> ValidateJwtConfiguration()
    {
        var jwtKey = HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:Key"];
        var jwtIssuer = HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:Issuer"];
        var jwtAudience = HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Jwt:Audience"];

        return Ok(new
        {
            KeyLength = jwtKey?.Length ?? 0,
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            Message = "JWT configuration loaded successfully"
        });
    }

    /// <summary>
    /// Check database state
    /// </summary>
    [HttpGet("db-check")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> CheckDatabase(CancellationToken ct)
    {
        var context = HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var userCount = await context.Users.CountAsync(ct);
        var taskCount = await context.Tasks.CountAsync(ct);

        return Ok(new
        {
            UserCount = userCount,
            TaskCount = taskCount,
            Message = "Database state checked"
        });
    }

    /// <summary>
    /// Create a test user for authentication
    /// </summary>
    [HttpPost("create-user")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> CreateTestUser(CancellationToken ct)
    {
        var context = HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var passwordHasher = HttpContext.RequestServices.GetRequiredService<IPasswordHasher>();

        // Check if test user already exists
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email.Value == "test@example.com", ct);
        if (existingUser != null)
        {
            return Ok(new { Message = "Test user already exists", Email = "test@example.com", Password = "password123" });
        }

        // Create new test user
        var user = Taskly.Domain.Users.User.Register(
            Taskly.Domain.Users.ValueObjects.Username.Create("test_user"),
            Email.Create("test@example.com"),
            PasswordHash.From(passwordHasher.Hash("password123")),
            DateTime.UtcNow
        );

        context.Users.Add(user);
        await context.SaveChangesAsync(ct);

        return Ok(new { Message = "Test user created successfully", Email = "test@example.com", Password = "password123" });
    }

    /// <summary>
    /// List all users for debugging
    /// </summary>
    [HttpGet("list-users")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> ListUsers(CancellationToken ct)
    {
        var context = HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var users = await context.Users
            .Select(u => new { u.Id, Username = u.Username.Value, Email = u.Email.Value, PasswordHash = u.PasswordHash.Value })
            .ToListAsync(ct);

        return Ok(new { Users = users, Count = users.Count });
    }
}
