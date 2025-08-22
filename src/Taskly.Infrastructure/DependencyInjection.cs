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
        var conn = config.GetConnectionString("DefaultConnection")!;
        services.AddDbContext<AppDbContext>(opt =>
        {
            opt.UseNpgsql(conn);
        });

        services.AddScoped<IRepository<User>, EfRepository<User>>();
        services.AddScoped<IRepository<TaskItem>, EfRepository<TaskItem>>();

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.Configure<JwtOptions>(options => config.GetSection(JwtOptions.SectionName).Bind(options));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<IDateTime, SystemDateTime>();

        return services;
    }
}
