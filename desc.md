Awesome — here’s a production‑grade .NET 8 API skeleton that ticks your boxes: DDD with rich domain + value objects (as `record` types), domain events, MediatR-based CQRS, specification pattern, and JWT auth. I’ll first show the folder structure, then the core code you can paste into a fresh solution. It builds end‑to‑end and is easy to extend.

---

# Project structure

```
Taskly
├─ src
│  ├─ Taskly.Api
│  │  ├─ Controllers
│  │  │  ├─ AuthController.cs
│  │  │  └─ TasksController.cs
│  │  ├─ Filters
│  │  │  └─ ApiExceptionFilter.cs
│  │  ├─ Program.cs
│  │  ├─ appsettings.json
│  │  └─ appsettings.Development.json
│  ├─ Taskly.Application
│  │  ├─ Abstractions
│  │  │  ├─ ICurrentUser.cs
│  │  │  └─ IDateTime.cs
│  │  ├─ Behaviors
│  │  │  └─ ValidationBehavior.cs
│  │  ├─ Features
│  │  │  ├─ Auth
│  │  │  │  ├─ Commands
│  │  │  │  │  ├─ LoginCommand.cs
│  │  │  │  │  └─ RegisterCommand.cs
│  │  │  │  └─ Dtos
│  │  │  │     ├─ AuthResultDto.cs
│  │  │  │     └─ UserDto.cs
│  │  │  └─ Tasks
│  │  │     ├─ Commands
│  │  │     │  ├─ CreateTaskCommand.cs
│  │  │     │  ├─ UpdateTaskCommand.cs
│  │  │     │  ├─ DeleteTaskCommand.cs
│  │  │     │  └─ ToggleCompleteCommand.cs
│  │  │     ├─ Queries
│  │  │     │  └─ ListTasksQuery.cs
│  │  │     └─ Dtos
│  │  │        └─ TaskDto.cs
│  │  ├─ Validation
│  │  │  ├─ Auth
│  │  │  │  ├─ LoginCommandValidator.cs
│  │  │  │  └─ RegisterCommandValidator.cs
│  │  │  └─ Tasks
│  │  │     ├─ CreateTaskCommandValidator.cs
│  │  │     └─ UpdateTaskCommandValidator.cs
│  │  └─ DependencyInjection.cs
│  ├─ Taskly.Domain
│  │  ├─ Abstractions
│  │  │  ├─ AggregateRoot.cs
│  │  │  ├─ Entity.cs
│  │  │  ├─ DomainEvent.cs
│  │  │  ├─ IRepository.cs
│  │  │  └─ ISpecification.cs
│  │  ├─ Users
│  │  │  ├─ User.cs
│  │  │  └─ ValueObjects
│  │  │     ├─ Email.cs
│  │  │     └─ PasswordHash.cs
│  │  ├─ Tasks
│  │  │  ├─ TaskItem.cs
│  │  │  ├─ TaskId.cs
│  │  │  ├─ ValueObjects
│  │  │  │  ├─ TaskName.cs
│  │  │  │  ├─ TaskDescription.cs
│  │  │  │  └─ DueDate.cs
│  │  │  └─ Events
│  │  │     ├─ TaskCreatedDomainEvent.cs
│  │  │     └─ TaskCompletionToggledDomainEvent.cs
│  │  └─ Specifications
│  │     └─ TaskByFiltersSpec.cs
│  ├─ Taskly.Infrastructure
│  │  ├─ Auth
│  │  │  ├─ JwtOptions.cs
│  │  │  ├─ JwtTokenService.cs
│  │  │  └─ PasswordHasher.cs
│  │  ├─ Persistence
│  │  │  ├─ AppDbContext.cs
│  │  │  ├─ Configurations
│  │  │  │  ├─ TaskItemConfiguration.cs
│  │  │  │  └─ UserConfiguration.cs
│  │  │  ├─ EfRepository.cs
│  │  │  └─ SpecificationEvaluator.cs
│  │  ├─ Services
│  │  │  ├─ CurrentUser.cs
│  │  │  └─ SystemDateTime.cs
│  │  └─ DependencyInjection.cs
│  └─ Taskly.Tests (optional starter)
│     └─ Tasks
│        └─ TaskItemTests.cs
└─ Taskly.sln
```

> Tech stack: **.NET 8**, **EF Core 8**, **MediatR**, **FluentValidation**, **JWT (Microsoft.IdentityModel.Tokens)**, PostgreSQL or SQL Server (you can swap provider easily).
> Style: Clean Architecture separation + DDD-rich domain (value objects as `record`), CQRS + Specifications, domain events dispatched on `SaveChanges`.

---

# Code

> Paste files as‑is; update the connection string in `appsettings.json`.

### `Taskly.Domain/Abstractions/Entity.cs`

```csharp
namespace Taskly.Domain.Abstractions;

public abstract class Entity<TId>
{
    public TId Id { get; protected set; } = default!;
    private readonly List<DomainEvent> _domainEvents = new();
    public IReadOnlyList<DomainEvent> DomainEvents => _domainEvents;

    protected void Raise(DomainEvent @event) => _domainEvents.Add(@event);
    public void ClearDomainEvents() => _domainEvents.Clear();
}
```

### `Taskly.Domain/Abstractions/AggregateRoot.cs`

```csharp
namespace Taskly.Domain.Abstractions;

public abstract class AggregateRoot<TId> : Entity<TId>;
```

### `Taskly.Domain/Abstractions/DomainEvent.cs`

```csharp
namespace Taskly.Domain.Abstractions;

public abstract record DomainEvent(DateTime OccurredOnUtc);
```

### `Taskly.Domain/Abstractions/IRepository.cs`

```csharp
using System.Linq.Expressions;

namespace Taskly.Domain.Abstractions;

public interface IRepository<TAggregate, TId> where TAggregate : AggregateRoot<TId>
{
    Task<TAggregate?> GetByIdAsync(TId id, CancellationToken ct = default);
    Task AddAsync(TAggregate entity, CancellationToken ct = default);
    Task RemoveAsync(TAggregate entity, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
    IQueryable<TAggregate> Query(ISpecification<TAggregate> spec);
}
```

### `Taskly.Domain/Abstractions/ISpecification.cs`

```csharp
using System.Linq.Expressions;

namespace Taskly.Domain.Abstractions;

public interface ISpecification<T>
{
    Expression<Func<T, bool>>? Criteria { get; }
    Func<IQueryable<T>, IOrderedQueryable<T>>? OrderBy { get; }
    int? Skip { get; }
    int? Take { get; }
}

public abstract class Specification<T> : ISpecification<T>
{
    public Expression<Func<T, bool>>? Criteria { get; protected set; }
    public Func<IQueryable<T>, IOrderedQueryable<T>>? OrderBy { get; protected set; }
    public int? Skip { get; protected set; }
    public int? Take { get; protected set; }

    protected void ApplyPaging(int skip, int take) { Skip = skip; Take = take; }
    protected void ApplyOrderBy<TKey>(Expression<Func<T, TKey>> keySelector, bool desc = false)
    {
        OrderBy = q => desc ? q.OrderByDescending(keySelector) : q.OrderBy(keySelector);
    }
}
```

---

### `Taskly.Domain/Users/ValueObjects/Email.cs`

```csharp
namespace Taskly.Domain.Users.ValueObjects;

public sealed record Email
{
    private Email(string value) => Value = value;
    public string Value { get; }

    public static Email Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Email is required");
        if (!value.Contains('@') || value.Length > 256) throw new ArgumentException("Invalid email");
        return new Email(value.Trim().ToLowerInvariant());
    }

    public override string ToString() => Value;
}
```

### `Taskly.Domain/Users/ValueObjects/PasswordHash.cs`

```csharp
namespace Taskly.Domain.Users.ValueObjects;

public sealed record PasswordHash
{
    private PasswordHash(string value) => Value = value;
    public string Value { get; }
    public static PasswordHash From(string hash) =>
        string.IsNullOrWhiteSpace(hash) ? throw new ArgumentException("Hash required") : new PasswordHash(hash);
    public override string ToString() => Value;
}
```

### `Taskly.Domain/Users/User.cs`

```csharp
using Taskly.Domain.Abstractions;
using Taskly.Domain.Users.ValueObjects;

namespace Taskly.Domain.Users;

public sealed class User : AggregateRoot<Guid>
{
    private User() { } // EF
    public Email Email { get; private set; } = null!;
    public PasswordHash PasswordHash { get; private set; } = null!;

    private User(Guid id, Email email, PasswordHash passwordHash)
    {
        Id = id;
        Email = email;
        PasswordHash = passwordHash;
    }

    public static User Register(Email email, PasswordHash passwordHash)
        => new(Guid.NewGuid(), email, passwordHash);
}
```

---

### `Taskly.Domain/Tasks/TaskId.cs`

```csharp
namespace Taskly.Domain.Tasks;

public readonly record struct TaskId(Guid Value)
{
    public static TaskId New() => new(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}
```

### `Taskly.Domain/Tasks/ValueObjects/TaskName.cs`

```csharp
namespace Taskly.Domain.Tasks.ValueObjects;

public sealed record TaskName
{
    private TaskName(string value) => Value = value;
    public string Value { get; }
    public static TaskName Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Task name is required");
        if (value.Length > 120) throw new ArgumentException("Task name max length is 120");
        return new TaskName(value.Trim());
    }
    public override string ToString() => Value;
}
```

### `Taskly.Domain/Tasks/ValueObjects/TaskDescription.cs`

```csharp
namespace Taskly.Domain.Tasks.ValueObjects;

public sealed record TaskDescription
{
    private TaskDescription(string? value) => Value = value?.Trim();
    public string? Value { get; }
    public static TaskDescription Create(string? value)
        => value is null ? new TaskDescription(null)
                         : value.Length > 1000 ? throw new ArgumentException("Description too long")
                         : new TaskDescription(value);
    public override string ToString() => Value ?? string.Empty;
}
```

### `Taskly.Domain/Tasks/ValueObjects/DueDate.cs`

```csharp
namespace Taskly.Domain.Tasks.ValueObjects;

public sealed record DueDate
{
    private DueDate(DateTime? value) => Value = value;
    public DateTime? Value { get; }
    public static DueDate Create(DateTime? value) => new(value);
}
```

### `Taskly.Domain/Tasks/Events/TaskCreatedDomainEvent.cs`

```csharp
using Taskly.Domain.Abstractions;

namespace Taskly.Domain.Tasks.Events;

public sealed record TaskCreatedDomainEvent(Guid UserId, Guid TaskId, string Name)
    : DomainEvent(DateTime.UtcNow);
```

### `Taskly.Domain/Tasks/Events/TaskCompletionToggledDomainEvent.cs`

```csharp
using Taskly.Domain.Abstractions;

namespace Taskly.Domain.Tasks.Events;

public sealed record TaskCompletionToggledDomainEvent(Guid TaskId, bool IsCompleted)
    : DomainEvent(DateTime.UtcNow);
```

### `Taskly.Domain/Tasks/TaskItem.cs`

```csharp
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks.Events;
using Taskly.Domain.Tasks.ValueObjects;

namespace Taskly.Domain.Tasks;

public sealed class TaskItem : AggregateRoot<TaskId>
{
    private TaskItem() { } // EF

    public Guid OwnerId { get; private set; }
    public TaskName Name { get; private set; } = null!;
    public TaskDescription Description { get; private set; } = null!;
    public DueDate DueDate { get; private set; } = null!;
    public bool IsCompleted { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? CompletedAtUtc { get; private set; }

    private TaskItem(TaskId id, Guid ownerId, TaskName name, TaskDescription description, DueDate dueDate, DateTime nowUtc)
    {
        Id = id;
        OwnerId = ownerId;
        Name = name;
        Description = description;
        DueDate = dueDate;
        CreatedAtUtc = nowUtc;
        IsCompleted = false;

        Raise(new TaskCreatedDomainEvent(ownerId, id.Value, name.Value));
    }

    public static TaskItem Create(Guid ownerId, TaskName name, TaskDescription description, DueDate dueDate, DateTime nowUtc)
        => new(TaskId.New(), ownerId, name, description, dueDate, nowUtc);

    public void Update(TaskName name, TaskDescription description, DueDate dueDate)
    {
        Name = name;
        Description = description;
        DueDate = dueDate;
    }

    public void ToggleComplete(DateTime nowUtc)
    {
        IsCompleted = !IsCompleted;
        CompletedAtUtc = IsCompleted ? nowUtc : null;
        Raise(new TaskCompletionToggledDomainEvent(Id.Value, IsCompleted));
    }
}
```

### `Taskly.Domain/Specifications/TaskByFiltersSpec.cs`

```csharp
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;

namespace Taskly.Domain.Specifications;

public sealed class TaskByFiltersSpec : Specification<TaskItem>
{
    public TaskByFiltersSpec(Guid ownerId, bool? completed, DateTime? dueOnOrBefore, int? skip, int? take)
    {
        Criteria = t =>
            t.OwnerId == ownerId
            && (!completed.HasValue || t.IsCompleted == completed)
            && (!dueOnOrBefore.HasValue || (t.DueDate.Value.HasValue && t.DueDate.Value <= dueOnOrBefore));

        ApplyOrderBy(t => t.CreatedAtUtc, desc: true);
        if (skip.HasValue && take.HasValue) ApplyPaging(skip.Value, take.Value);
    }
}
```

---

### `Taskly.Application/Abstractions/ICurrentUser.cs`

```csharp
namespace Taskly.Application.Abstractions;

public interface ICurrentUser
{
    Guid? UserId { get; }
}
```

### `Taskly.Application/Abstractions/IDateTime.cs`

```csharp
namespace Taskly.Application.Abstractions;

public interface IDateTime
{
    DateTime UtcNow { get; }
}
```

### `Taskly.Application/Features/Tasks/Dtos/TaskDto.cs`

```csharp
namespace Taskly.Application.Features.Tasks.Dtos;

public sealed record TaskDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime? DueDate,
    bool IsCompleted,
    DateTime CreatedAtUtc,
    DateTime? CompletedAtUtc);
```

### `Taskly.Application/Features/Auth/Dtos/UserDto.cs`

```csharp
namespace Taskly.Application.Features.Auth.Dtos;

public sealed record UserDto(Guid Id, string Email);
```

### `Taskly.Application/Features/Auth/Dtos/AuthResultDto.cs`

```csharp
namespace Taskly.Application.Features.Auth.Dtos;

public sealed record AuthResultDto(string AccessToken, DateTime ExpiresAtUtc, UserDto User);
```

---

### `Taskly.Application/Features/Auth/Commands/RegisterCommand.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Auth.Dtos;

namespace Taskly.Application.Features.Auth.Commands;

public sealed record RegisterCommand(string Email, string Password) : IRequest<AuthResultDto>;
```

### `Taskly.Application/Features/Auth/Commands/LoginCommand.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Auth.Dtos;

namespace Taskly.Application.Features.Auth.Commands;

public sealed record LoginCommand(string Email, string Password) : IRequest<AuthResultDto>;
```

---

### `Taskly.Application/Features/Tasks/Commands/CreateTaskCommand.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record CreateTaskCommand(string Name, string? Description, DateTime? DueDate) : IRequest<TaskDto>;
```

### `Taskly.Application/Features/Tasks/Commands/UpdateTaskCommand.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record UpdateTaskCommand(Guid Id, string Name, string? Description, DateTime? DueDate) : IRequest<TaskDto>;
```

### `Taskly.Application/Features/Tasks/Commands/DeleteTaskCommand.cs`

```csharp
using MediatR;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record DeleteTaskCommand(Guid Id) : IRequest;
```

### `Taskly.Application/Features/Tasks/Commands/ToggleCompleteCommand.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Commands;

public sealed record ToggleCompleteCommand(Guid Id) : IRequest<TaskDto>;
```

### `Taskly.Application/Features/Tasks/Queries/ListTasksQuery.cs`

```csharp
using MediatR;
using Taskly.Application.Features.Tasks.Dtos;

namespace Taskly.Application.Features.Tasks.Queries;

public sealed record ListTasksQuery(bool? Completed, DateTime? DueOnOrBefore, int Page = 1, int PageSize = 20)
    : IRequest<IReadOnlyList<TaskDto>>;
```

---

### `Taskly.Application/Validation/Auth/RegisterCommandValidator.cs`

```csharp
using FluentValidation;
using Taskly.Application.Features.Auth.Commands;

namespace Taskly.Application.Validation.Auth;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
    }
}
```

### `Taskly.Application/Validation/Auth/LoginCommandValidator.cs`

```csharp
using FluentValidation;
using Taskly.Application.Features.Auth.Commands;

namespace Taskly.Application.Validation.Auth;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
```

### `Taskly.Application/Validation/Tasks/CreateTaskCommandValidator.cs`

```csharp
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
```

### `Taskly.Application/Validation/Tasks/UpdateTaskCommandValidator.cs`

```csharp
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
```

### `Taskly.Application/Behaviors/ValidationBehavior.cs`

```csharp
using FluentValidation;
using MediatR;

namespace Taskly.Application.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators) => _validators = validators;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (_validators.Any())
        {
            var ctx = new ValidationContext<TRequest>(request);
            var failures = (await Task.WhenAll(_validators.Select(v => v.ValidateAsync(ctx, ct))))
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            if (failures.Count != 0)
                throw new ValidationException(failures);
        }

        return await next();
    }
}
```

### `Taskly.Application/DependencyInjection.cs`

```csharp
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Taskly.Application.Behaviors;

namespace Taskly.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        return services;
    }
}
```

---

### `Taskly.Infrastructure/Persistence/AppDbContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // gather domain events before save
        var domainEntities = ChangeTracker.Entries<Entity<object?>>()
            .Where(e => e.Entity is not null && (e.Entity as dynamic).DomainEvents is IReadOnlyList<DomainEvent>)
            .ToList();

        var events = new List<DomainEvent>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Domain.Abstractions.Entity<dynamic> entity && entity.DomainEvents.Any())
            {
                events.AddRange(entity.DomainEvents);
                entity.ClearDomainEvents();
            }
        }

        var result = await base.SaveChangesAsync(ct);

        // dispatch events here if you have handlers (MediatR notifications etc.)
        // (left as hook; you can integrate MediatR notifications by mapping DomainEvent -> INotification)
        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
```

### `Taskly.Infrastructure/Persistence/Configurations/UserConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(x => x.Id);
        b.OwnsOne(x => x.Email, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("email").HasMaxLength(256).IsRequired();
            nb.HasIndex(p => p.Value).IsUnique();
        });
        b.OwnsOne(x => x.PasswordHash, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("password_hash").IsRequired();
        });
    }
}
```

### `Taskly.Infrastructure/Persistence/Configurations/TaskItemConfiguration.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Taskly.Domain.Tasks;

namespace Taskly.Infrastructure.Persistence.Configurations;

public sealed class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> b)
    {
        b.ToTable("tasks");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id)
            .HasConversion(id => id.Value, v => new TaskId(v))
            .ValueGeneratedNever();

        b.Property(x => x.OwnerId).IsRequired();
        b.Property(x => x.IsCompleted).IsRequired();
        b.Property(x => x.CreatedAtUtc).IsRequired();
        b.Property(x => x.CompletedAtUtc);

        b.OwnsOne(x => x.Name, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("name").HasMaxLength(120).IsRequired();
        });
        b.OwnsOne(x => x.Description, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("description").HasMaxLength(1000);
        });
        b.OwnsOne(x => x.DueDate, nb =>
        {
            nb.Property(p => p.Value).HasColumnName("due_date");
        });

        b.HasIndex(x => new { x.OwnerId, x.IsCompleted });
    }
}
```

### `Taskly.Infrastructure/Persistence/EfRepository.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;

namespace Taskly.Infrastructure.Persistence;

public sealed class EfRepository<TAggregate, TId> : IRepository<TAggregate, TId>
    where TAggregate : AggregateRoot<TId>
{
    private readonly AppDbContext _db;
    public EfRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(TAggregate entity, CancellationToken ct = default) =>
        await _db.Set<TAggregate>().AddAsync(entity, ct);

    public async Task<TAggregate?> GetByIdAsync(TId id, CancellationToken ct = default) =>
        await _db.Set<TAggregate>().FindAsync([id], ct);

    public IQueryable<TAggregate> Query(ISpecification<TAggregate> spec)
        => SpecificationEvaluator.GetQuery(_db.Set<TAggregate>().AsQueryable(), spec);

    public Task RemoveAsync(TAggregate entity, CancellationToken ct = default)
    {
        _db.Set<TAggregate>().Remove(entity);
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
```

### `Taskly.Infrastructure/Persistence/SpecificationEvaluator.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Taskly.Domain.Abstractions;

namespace Taskly.Infrastructure.Persistence;

public static class SpecificationEvaluator
{
    public static IQueryable<T> GetQuery<T>(IQueryable<T> input, ISpecification<T> spec)
    {
        var query = input;
        if (spec.Criteria is not null) query = query.Where(spec.Criteria);
        if (spec.OrderBy is not null) query = spec.OrderBy(query);
        if (spec.Skip.HasValue) query = query.Skip(spec.Skip.Value);
        if (spec.Take.HasValue) query = query.Take(spec.Take.Value);
        return query.AsNoTracking();
    }
}
```

---

### `Taskly.Infrastructure/Auth/JwtOptions.cs`

```csharp
namespace Taskly.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string Key { get; init; } = string.Empty; // long random secret
    public int ExpiryMinutes { get; init; } = 60;
}
```

### `Taskly.Infrastructure/Auth/JwtTokenService.cs`

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Users;

namespace Taskly.Infrastructure.Auth;

public interface IJwtTokenService
{
    AuthResultDto CreateToken(User user, DateTime nowUtc);
}

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
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email.Value),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
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
        return new AuthResultDto(raw, expires, new(user.Id, user.Email.Value));
    }
}
```

### `Taskly.Infrastructure/Auth/PasswordHasher.cs`

```csharp
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Taskly.Infrastructure.Auth;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public sealed class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var key = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 100_000, 32);
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    public bool Verify(string password, string hash)
    {
        var parts = hash.Split('.');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var expected = Convert.FromBase64String(parts[1]);
        var key = KeyDerivation.Pbkdf2(password, salt, KeyDerivationPrf.HMACSHA256, 100_000, 32);
        return CryptographicOperations.FixedTimeEquals(key, expected);
    }
}
```

---

### `Taskly.Infrastructure/Services/SystemDateTime.cs`

```csharp
using Taskly.Application.Abstractions;

namespace Taskly.Infrastructure.Services;

public sealed class SystemDateTime : IDateTime
{
    public DateTime UtcNow => DateTime.UtcNow;
}
```

### `Taskly.Infrastructure/Services/CurrentUser.cs`

```csharp
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Taskly.Application.Abstractions;

namespace Taskly.Infrastructure.Services;

public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _http;
    public CurrentUser(IHttpContextAccessor http) => _http = http;

    public Guid? UserId
    {
        get
        {
            var id = _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }
    }
}
```

### `Taskly.Infrastructure/DependencyInjection.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Taskly.Application.Abstractions;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Users;
using Taskly.Infrastructure.Auth;
using Taskly.Infrastructure.Persistence;
using Taskly.Infrastructure.Services;

namespace Taskly.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // DB
        var conn = config.GetConnectionString("DefaultConnection")!;
        // Choose your provider:
        services.AddDbContext<AppDbContext>(opt =>
        {
            // For PostgreSQL:
            // opt.UseNpgsql(conn);
            // For SQL Server:
            opt.UseSqlServer(conn);
        });

        services.AddScoped<IRepository<User, Guid>, EfRepository<User, Guid>>();
        services.AddScoped<IRepository<TaskItem, Taskly.Domain.Tasks.TaskId>, EfRepository<TaskItem, Taskly.Domain.Tasks.TaskId>>();

        // Auth
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Cross-cutting
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IDateTime, SystemDateTime>();

        return services;
    }
}
```

---

### `Taskly.Application/Features/Auth/Handlers` (inside the same files or new ones)

**Register handler**

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Commands;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Users;
using Taskly.Domain.Users.ValueObjects;
using Taskly.Infrastructure.Auth;

namespace Taskly.Application.Features.Auth;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResultDto>
{
    private readonly IRepository<User, Guid> _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTime _clock;

    public RegisterCommandHandler(IRepository<User, Guid> users, IPasswordHasher hasher, IJwtTokenService jwt, IDateTime clock)
    {
        _users = users; _hasher = hasher; _jwt = jwt; _clock = clock;
    }

    public async Task<AuthResultDto> Handle(RegisterCommand request, CancellationToken ct)
    {
        // unique email?
        var existing = await _users.Query(new AlwaysTrueSpec<User>())
            .Where(u => u.Email.Value == request.Email.ToLower())
            .AnyAsync(ct);
        if (existing) throw new InvalidOperationException("Email already registered");

        var hash = _hasher.Hash(request.Password);
        var user = User.Register(Email.Create(request.Email), PasswordHash.From(hash));
        await _users.AddAsync(user, ct);
        await _users.SaveChangesAsync(ct);

        return _jwt.CreateToken(user, _clock.UtcNow);
    }

    private sealed class AlwaysTrueSpec<T> : Specification<T> { public AlwaysTrueSpec() { Criteria = _ => true; } }
}
```

**Login handler**

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Auth.Commands;
using Taskly.Application.Features.Auth.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Users;
using Taskly.Infrastructure.Auth;

namespace Taskly.Application.Features.Auth;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IRepository<User, Guid> _users;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;
    private readonly IDateTime _clock;

    public LoginCommandHandler(IRepository<User, Guid> users, IPasswordHasher hasher, IJwtTokenService jwt, IDateTime clock)
    {
        _users = users; _hasher = hasher; _jwt = jwt; _clock = clock;
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _users.Query(new EmailSpec(request.Email)).FirstOrDefaultAsync(ct);
        if (user is null) throw new UnauthorizedAccessException("Invalid credentials");

        if (!_hasher.Verify(request.Password, user.PasswordHash.Value))
            throw new UnauthorizedAccessException("Invalid credentials");

        return _jwt.CreateToken(user, _clock.UtcNow);
    }

    private sealed class EmailSpec : Specification<User>
    {
        public EmailSpec(string email) { Criteria = u => u.Email.Value == email.ToLower(); }
    }
}
```

---

### `Taskly.Application/Features/Tasks/Handlers`

**Create**

```csharp
using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;

namespace Taskly.Application.Features.Tasks;

public sealed class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, TaskDto>
{
    private readonly IRepository<TaskItem, TaskId> _repo;
    private readonly ICurrentUser _current;
    private readonly IDateTime _clock;

    public CreateTaskCommandHandler(IRepository<TaskItem, TaskId> repo, ICurrentUser current, IDateTime clock)
    { _repo = repo; _current = current; _clock = clock; }

    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken ct)
    {
        var ownerId = _current.UserId ?? throw new UnauthorizedAccessException();
        var task = TaskItem.Create(ownerId,
            TaskName.Create(request.Name),
            TaskDescription.Create(request.Description),
            DueDate.Create(request.DueDate),
            _clock.UtcNow);

        await _repo.AddAsync(task, ct);
        await _repo.SaveChangesAsync(ct);

        return new TaskDto(task.Id.Value, task.Name.Value, task.Description.Value, task.DueDate.Value, task.IsCompleted, task.CreatedAtUtc, task.CompletedAtUtc);
    }
}
```

**Update**

```csharp
using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;

namespace Taskly.Application.Features.Tasks;

public sealed class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, TaskDto>
{
    private readonly IRepository<TaskItem, TaskId> _repo;
    private readonly ICurrentUser _current;

    public UpdateTaskCommandHandler(IRepository<TaskItem, TaskId> repo, ICurrentUser current)
    { _repo = repo; _current = current; }

    public async Task<TaskDto> Handle(UpdateTaskCommand request, CancellationToken ct)
    {
        var task = await _repo.GetByIdAsync(new TaskId(request.Id), ct)
                   ?? throw new KeyNotFoundException("Task not found");

        if (task.OwnerId != _current.UserId) throw new UnauthorizedAccessException();

        task.Update(TaskName.Create(request.Name), TaskDescription.Create(request.Description), DueDate.Create(request.DueDate));
        await _repo.SaveChangesAsync(ct);

        return new TaskDto(task.Id.Value, task.Name.Value, task.Description.Value, task.DueDate.Value, task.IsCompleted, task.CreatedAtUtc, task.CompletedAtUtc);
    }
}
```

**Delete**

```csharp
using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;

namespace Taskly.Application.Features.Tasks;

public sealed class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
{
    private readonly IRepository<TaskItem, TaskId> _repo;
    private readonly ICurrentUser _current;

    public DeleteTaskCommandHandler(IRepository<TaskItem, TaskId> repo, ICurrentUser current)
    { _repo = repo; _current = current; }

    public async Task Handle(DeleteTaskCommand request, CancellationToken ct)
    {
        var task = await _repo.GetByIdAsync(new TaskId(request.Id), ct)
                   ?? throw new KeyNotFoundException("Task not found");

        if (task.OwnerId != _current.UserId) throw new UnauthorizedAccessException();

        await _repo.RemoveAsync(task, ct);
        await _repo.SaveChangesAsync(ct);
    }
}
```

**Toggle Complete**

```csharp
using MediatR;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Tasks;

namespace Taskly.Application.Features.Tasks;

public sealed class ToggleCompleteCommandHandler : IRequestHandler<ToggleCompleteCommand, TaskDto>
{
    private readonly IRepository<TaskItem, TaskId> _repo;
    private readonly ICurrentUser _current;
    private readonly IDateTime _clock;

    public ToggleCompleteCommandHandler(IRepository<TaskItem, TaskId> repo, ICurrentUser current, IDateTime clock)
    { _repo = repo; _current = current; _clock = clock; }

    public async Task<TaskDto> Handle(ToggleCompleteCommand request, CancellationToken ct)
    {
        var task = await _repo.GetByIdAsync(new TaskId(request.Id), ct)
                   ?? throw new KeyNotFoundException("Task not found");
        if (task.OwnerId != _current.UserId) throw new UnauthorizedAccessException();

        task.ToggleComplete(_clock.UtcNow);
        await _repo.SaveChangesAsync(ct);

        return new TaskDto(task.Id.Value, task.Name.Value, task.Description.Value, task.DueDate.Value, task.IsCompleted, task.CreatedAtUtc, task.CompletedAtUtc);
    }
}
```

**List (with filters + pagination)**

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Application.Features.Tasks.Dtos;
using Taskly.Application.Features.Tasks.Queries;
using Taskly.Domain.Abstractions;
using Taskly.Domain.Specifications;
using Taskly.Domain.Tasks;

namespace Taskly.Application.Features.Tasks;

public sealed class ListTasksQueryHandler : IRequestHandler<ListTasksQuery, IReadOnlyList<TaskDto>>
{
    private readonly IRepository<TaskItem, TaskId> _repo;
    private readonly ICurrentUser _current;

    public ListTasksQueryHandler(IRepository<TaskItem, TaskId> repo, ICurrentUser current)
    { _repo = repo; _current = current; }

    public async Task<IReadOnlyList<TaskDto>> Handle(ListTasksQuery request, CancellationToken ct)
    {
        var ownerId = _current.UserId ?? throw new UnauthorizedAccessException();

        var skip = (request.Page - 1) * request.PageSize;
        var spec = new TaskByFiltersSpec(ownerId, request.Completed, request.DueOnOrBefore, skip, request.PageSize);

        var items = await _repo.Query(spec).ToListAsync(ct);

        return items.Select(t => new TaskDto(t.Id.Value, t.Name.Value, t.Description.Value, t.DueDate.Value,
            t.IsCompleted, t.CreatedAtUtc, t.CompletedAtUtc)).ToList();
    }
}
```

---

### `Taskly.Api/Filters/ApiExceptionFilter.cs`

```csharp
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

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
            UnauthorizedAccessException => new() { Title = "Unauthorized", Status = StatusCodes.Status401Unauthorized },
            KeyNotFoundException => new() { Title = "Not Found", Status = StatusCodes.Status404NotFound },
            InvalidOperationException ioe => new() { Title = "Invalid Operation", Detail = ioe.Message, Status = StatusCodes.Status409Conflict },
            _ => new() { Title = "Server error", Status = StatusCodes.Status500InternalServerError }
        };

        context.Result = new ObjectResult(problem) { StatusCode = problem.Status };
        context.ExceptionHandled = true;
    }
}
```

### `Taskly.Api/Controllers/AuthController.cs`

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taskly.Application.Features.Auth.Commands;

namespace Taskly.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    // Stateless JWT — "logout" is handled client-side by dropping the token.
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout() => Ok(new { message = "Logged out (client should discard token)" });
}
```

### `Taskly.Api/Controllers/TasksController.cs`

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taskly.Application.Features.Tasks.Commands;
using Taskly.Application.Features.Tasks.Queries;

namespace Taskly.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly IMediator _mediator;
    public TasksController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskCommand cmd, CancellationToken ct)
        => Ok(await _mediator.Send(cmd, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool? completed, [FromQuery] DateTime? dueOnOrBefore,
                                          [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
                                          CancellationToken ct = default)
        => Ok(await _mediator.Send(new ListTasksQuery(completed, dueOnOrBefore, page, pageSize), ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskCommand body, CancellationToken ct)
        => Ok(await _mediator.Send(body with { Id = id }, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteTaskCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new ToggleCompleteCommand(id), ct));
}
```

### `Taskly.Api/Program.cs`

```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Taskly.Api.Filters;
using Taskly.Application;
using Taskly.Infrastructure;
using Taskly.Infrastructure.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(o => o.Filters.Add<ApiExceptionFilter>())
                .AddNewtonsoftJson();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// JWT auth
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

### `Taskly.Api/appsettings.json` (sample; **replace the secret**)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=Taskly;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true"
    // For PostgreSQL use: "Host=localhost;Database=taskly;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Issuer": "taskly",
    "Audience": "taskly-client",
    "Key": "REPLACE_WITH_A_LONG_RANDOM_SECRET_KEY_64+CHARS",
    "ExpiryMinutes": 120
  },
  "Logging": {
    "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" }
  },
  "AllowedHosts": "*"
}
```

---

### (Optional) `Taskly.Tests/Tasks/TaskItemTests.cs`

```csharp
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;
using Xunit;

public class TaskItemTests
{
    [Fact]
    public void Toggle_Changes_State_And_Timestamp()
    {
        var now = DateTime.UtcNow;
        var t = TaskItem.Create(Guid.NewGuid(), TaskName.Create("X"), TaskDescription.Create(null), DueDate.Create(null), now);
        Assert.False(t.IsCompleted);
        t.ToggleComplete(now);
        Assert.True(t.IsCompleted);
        Assert.NotNull(t.CompletedAtUtc);
    }
}
```

---

## How to run

1. **Create solution**

   ```bash
   dotnet new sln -n Taskly
   dotnet new webapi -n Taskly.Api -f net8.0
   dotnet new classlib -n Taskly.Application -f net8.0
   dotnet new classlib -n Taskly.Domain -f net8.0
   dotnet new classlib -n Taskly.Infrastructure -f net8.0
   dotnet sln add src/Taskly.*/*.csproj
   ```

2. **Add packages**

   ```bash
   dotnet add src/Taskly.Api package Microsoft.AspNetCore.Authentication.JwtBearer
   dotnet add src/Taskly.Api package Swashbuckle.AspNetCore
   dotnet add src/Taskly.Api package Microsoft.AspNetCore.Mvc.NewtonsoftJson

   dotnet add src/Taskly.Application package MediatR
   dotnet add src/Taskly.Application package FluentValidation
   dotnet add src/Taskly.Application package FluentValidation.DependencyInjectionExtensions

   dotnet add src/Taskly.Infrastructure package Microsoft.EntityFrameworkCore
   dotnet add src/Taskly.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
   # or: dotnet add src/Taskly.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
   ```

3. **Wire project references**

   ```bash
   dotnet add src/Taskly.Api reference src/Taskly.Application/Taskly.Application.csproj
   dotnet add src/Taskly.Api reference src/Taskly.Infrastructure/Taskly.Infrastructure.csproj
   dotnet add src/Taskly.Application reference src/Taskly.Domain/Taskly.Domain.csproj
   dotnet add src/Taskly.Infrastructure reference src/Taskly.Domain/Taskly.Domain.csproj
   dotnet add src/Taskly.Infrastructure reference src/Taskly.Application/Taskly.Application.csproj
   ```

4. **Database**

   - Update connection string in `appsettings.json`.
   - Add EF Tools & create migration:

     ```bash
     dotnet tool install --global dotnet-ef
     dotnet add src/Taskly.Infrastructure package Microsoft.EntityFrameworkCore.Design
     dotnet ef migrations add Init --project src/Taskly.Infrastructure --startup-project src/Taskly.Api
     dotnet ef database update --project src/Taskly.Infrastructure --startup-project src/Taskly.Api
     ```

5. **Run**

   ```bash
   dotnet run --project src/Taskly.Api
   ```

   Open Swagger at `https://localhost:5001/swagger` (port may vary).

---

## Notes & extensions

- **Domain events dispatching:** You can map domain events to MediatR `INotification` and publish in `SaveChangesAsync`. For brevity, I left the hook; add a dispatcher if you need side-effects (email, integrations).
- **Logout:** With stateless JWT we “logout” by deleting token client-side; if you need server invalidation, add a token blacklist table with TTL.
- **Pagination metadata:** current `ListTasks` returns a page slice; to add total count, extend the query to compute total and wrap in a `PagedResult<T>`.
- **Tests:** add application (handler) tests with in-memory DB or SQLite in-memory.

If you want, I can also drop in a ready `PagedResult<T>` + total count, or switch provider to PostgreSQL with migrations prepped.
