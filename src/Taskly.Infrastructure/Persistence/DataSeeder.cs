using Microsoft.EntityFrameworkCore;
using Taskly.Application.Abstractions;
using Taskly.Domain.Tasks;
using Taskly.Domain.Tasks.ValueObjects;
using Taskly.Domain.Users;
using Taskly.Domain.Users.ValueObjects;
using Taskly.Infrastructure.Auth;

namespace Taskly.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext context, IPasswordHasher passwordHasher)
    {
        if (await context.Users.AnyAsync())
            return; // Already seeded

        // Create users with consistent GUIDs for seeding
        var user1 = User.Seed(
            new Guid("11111111-1111-1111-1111-111111111111"),
            Username.Create("john_doe"),
            Email.Create("john@example.com"),
            PasswordHash.From(passwordHasher.Hash("password123")),
            DateTime.UtcNow
        );

        var user2 = User.Seed(
            new Guid("22222222-2222-2222-2222-222222222222"),
            Username.Create("jane_smith"),
            Email.Create("jane@example.com"),
            PasswordHash.From(passwordHasher.Hash("password123")),
            DateTime.UtcNow
        );

        context.Users.AddRange(user1, user2);
        await context.SaveChangesAsync(); // Save users first to get their IDs

        // Create tasks for user1
        var tasks1 = new[]
        {
            TaskItem.Create(user1.Id, TaskName.Create("Complete API Documentation"), TaskDescription.Create("Write comprehensive API documentation"), DueDate.Create(DateTime.UtcNow.AddDays(7)), DateTime.UtcNow),
            TaskItem.Create(user1.Id, TaskName.Create("Setup CI/CD Pipeline"), TaskDescription.Create("Configure automated deployment pipeline"), DueDate.Create(DateTime.UtcNow.AddDays(14)), DateTime.UtcNow),
            TaskItem.Create(user1.Id, TaskName.Create("Code Review"), TaskDescription.Create("Review pull requests from team"), DueDate.Create(DateTime.UtcNow.AddDays(2)), DateTime.UtcNow)
        };

        // Create tasks for user2
        var tasks2 = new[]
        {
            TaskItem.Create(user2.Id, TaskName.Create("Design Database Schema"), TaskDescription.Create("Create ERD for new features"), DueDate.Create(DateTime.UtcNow.AddDays(5)), DateTime.UtcNow),
            TaskItem.Create(user2.Id, TaskName.Create("Write Unit Tests"), TaskDescription.Create("Add test coverage for core functionality"), DueDate.Create(DateTime.UtcNow.AddDays(10)), DateTime.UtcNow)
        };

        context.Tasks.AddRange(tasks1);
        context.Tasks.AddRange(tasks2);

        await context.SaveChangesAsync(); // Save tasks
    }
}
