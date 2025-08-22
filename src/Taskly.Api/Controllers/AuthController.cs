using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taskly.Application.Features.Auth.Commands;

namespace Taskly.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    // Stateless JWT — "logout" is handled client-side by dropping the token.
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout() => Ok(new { message = "Logged out (client should discard token)" });
}

