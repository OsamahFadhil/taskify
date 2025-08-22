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
            if (_httpContextAccessor.HttpContext == null)
            {
                return null;
            }

            if (_httpContextAccessor.HttpContext.User?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            var id = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value
                  ?? _httpContextAccessor.HttpContext?.User?.FindFirst("nameid")?.Value;

            if (string.IsNullOrEmpty(id))
            {
                return null;
            }

            var success = Guid.TryParse(id, out var userId);
            return success ? userId : null;
        }
    }
}
