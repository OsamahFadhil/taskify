using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Auth;

public sealed class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _opts;
    public JwtTokenService(IOptions<JwtOptions> opts) => _opts = opts.Value;

    public AuthResultDto CreateToken(User user, DateTime nowUtc)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Primary claim for user ID
            new Claim(ClaimTypes.Name, user.Username.Value), // Username claim
            new Claim(ClaimTypes.Email, user.Email.Value), // Email claim
            new Claim("sub", user.Id.ToString()), // Subject claim (alternative)
            new Claim("user_id", user.Id.ToString()), // Custom claim for user ID
            new Claim("username", user.Username.Value) // Custom claim for username
        };

        var expires = nowUtc.AddMinutes(_opts.ExpiryMinutes);
        var token = new JwtSecurityToken(
            issuer: _opts.Issuer,
            audience: _opts.Audience,
            claims: claims,
            notBefore: nowUtc,
            expires: expires,
            signingCredentials: creds);

        var raw = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResultDto(raw, expires, new(user.Id, user.Username.Value, user.Email.Value));
    }
}
