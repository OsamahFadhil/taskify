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
            opt.UseNpgsql(conn);
            // For SQL Server:
            // opt.UseSqlServer(conn);
        });

        services.AddScoped<IRepository<User>, EfRepository<User>>();
        services.AddScoped<IRepository<TaskItem>, EfRepository<TaskItem>>();

        // Auth
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.Configure<JwtOptions>(options => config.GetSection(JwtOptions.SectionName).Bind(options));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        // Cross-cutting
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IDateTime, SystemDateTime>();

        return services;
    }
}
