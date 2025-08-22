using FluentValidation;
using Taskly.Application.Features.Tasks.Commands;

namespace Taskly.Application.Validation.Tasks;

public sealed class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
{
    public UpdateTaskCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Description).MaximumLength(1000).When(x => x.Description != null);
    }
}

