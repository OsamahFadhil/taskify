using MediatR;
using Taskly.Application.Features.Auth.Dtos;

namespace Taskly.Application.Features.Auth.Commands;

public sealed record LoginCommand(string UsernameOrEmail, string Password) : IRequest<AuthResultDto>;

