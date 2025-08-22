using FluentValidation;
using Taskly.Application.Features.Tasks.Commands;

namespace Taskly.Application.Validation.Tasks;

public sealed class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
{
    public CreateTaskCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description != null);
    }
}

