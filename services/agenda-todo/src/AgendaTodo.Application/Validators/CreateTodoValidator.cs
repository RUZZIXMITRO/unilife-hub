using AgendaTodo.Application.DTOs;
using FluentValidation;

namespace AgendaTodo.Application.Validators;

public class CreateTodoValidator : AbstractValidator<CreateTodoDto>
{
    public CreateTodoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Le titre est obligatoire")
            .MaximumLength(255);

        RuleFor(x => x.Category)
            .MaximumLength(100);
    }
}