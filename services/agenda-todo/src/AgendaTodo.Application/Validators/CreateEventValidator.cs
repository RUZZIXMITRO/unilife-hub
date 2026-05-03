using AgendaTodo.Application.DTOs;
using FluentValidation;

namespace AgendaTodo.Application.Validators;

public class CreateEventValidator : AbstractValidator<CreateEventDto>
{
    public CreateEventValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Le titre est obligatoire")
            .MaximumLength(255).WithMessage("Le titre ne peut dépasser 255 caractères");

        RuleFor(x => x.StartDateTime)
            .NotEmpty().WithMessage("La date de début est obligatoire");

        RuleFor(x => x.EndDateTime)
            .GreaterThan(x => x.StartDateTime)
            .WithMessage("La date de fin doit être après la date de début");

        RuleFor(x => x.Location)
            .MaximumLength(255);
    }
}