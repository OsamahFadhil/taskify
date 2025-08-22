namespace Taskly.Application.Features.Auth.Dtos;

public sealed record AuthResultDto(string AccessToken, DateTime ExpiresAtUtc, UserDto User);

