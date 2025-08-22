using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Taskly.Application.Abstractions;

namespace Taskly.Infrastructure.Services;

public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            Console.WriteLine($"🔍 CurrentUser.UserId called");
            Console.WriteLine($"🔍 HttpContext exists: {_httpContextAccessor.HttpContext != null}");

            if (_httpContextAccessor.HttpContext == null)
            {
                Console.WriteLine("❌ HttpContext is null");
                return null;
            }

            Console.WriteLine($"🔍 User exists: {_httpContextAccessor.HttpContext.User != null}");
            Console.WriteLine($"🔍 User.Identity.IsAuthenticated: {_httpContextAccessor.HttpContext.User?.Identity?.IsAuthenticated}");

            if (_httpContextAccessor.HttpContext.User?.Identity?.IsAuthenticated != true)
            {
                Console.WriteLine("❌ User is not authenticated");
                return null;
            }

            // Try multiple claim types to ensure we find the user ID
            var id = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value
                  ?? _httpContextAccessor.HttpContext?.User?.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(id))
            {
                Console.WriteLine($"🔍 No user ID found in claims. Available claims:");
                var claims = _httpContextAccessor.HttpContext?.User?.Claims;
                if (claims != null)
                {
                    foreach (var claim in claims)
                    {
                        Console.WriteLine($"  - {claim.Type}: {claim.Value}");
                    }
                }
                return null;
            }

            Console.WriteLine($"🔍 Found user ID in claims: {id}");
            var success = Guid.TryParse(id, out var userId);
            Console.WriteLine($"🔍 GUID parsing success: {success}, Result: {userId}");
            return success ? userId : null;
        }
    }
}
