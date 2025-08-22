using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Taskly.Application.Common.Exceptions;

namespace Taskly.Api.Filters;

public sealed class ApiExceptionFilter : IExceptionFilter
{
    private readonly ILogger<ApiExceptionFilter> _logger;
    public ApiExceptionFilter(ILogger<ApiExceptionFilter> logger) => _logger = logger;

    public void OnException(ExceptionContext context)
    {
        var ex = context.Exception;
        _logger.LogError(ex, "Unhandled exception");

        ProblemDetails problem = ex switch
        {
            ValidationException ve => new()
            {
                Title = "Validation failed",
                Status = StatusCodes.Status400BadRequest,
                Detail = string.Join("; ", ve.Errors.Select(e => e.ErrorMessage))
            },
            DuplicateRegistrationException dre => new()
            {
                Title = "Registration failed",
                Status = StatusCodes.Status409Conflict,
                Detail = dre.Message
            },
            UnauthorizedAccessException => new() { Title = "Unauthorized", Status = StatusCodes.Status401Unauthorized },
            KeyNotFoundException => new() { Title = "Not Found", Status = StatusCodes.Status404NotFound },
            InvalidOperationException ioe => new() { Title = "Invalid Operation", Detail = ioe.Message, Status = StatusCodes.Status409Conflict },
            _ => new() { Title = "Server error", Status = StatusCodes.Status500InternalServerError }
        };

        context.Result = new ObjectResult(problem) { StatusCode = problem.Status };
        context.ExceptionHandled = true;
    }
}

