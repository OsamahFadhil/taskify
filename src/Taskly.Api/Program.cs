using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Taskly.Api.Filters;
using Taskly.Application;
using Taskly.Infrastructure;
using Taskly.Infrastructure.Persistence;
using Taskly.Application.Abstractions;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowedToAllowWildcardSubdomains();
    });
});

builder.Services.AddControllers(o => o.Filters.Add<ApiExceptionFilter>())
                .AddNewtonsoftJson();

builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Taskly API", Version = "v1" });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// JWT auth
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT key is not configured");
}

Console.WriteLine($"JWT Configuration - Key Length: {jwtKey.Length}, Issuer: {jwtIssuer}, Audience: {jwtAudience}");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Add event handlers for debugging
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Token;
                Console.WriteLine($"🔍 JWT Token Received: {token?.Substring(0, Math.Min(50, token?.Length ?? 0))}...");
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"❌ JWT Authentication Failed: {context.Exception.Message}");
                Console.WriteLine($"🔍 Exception Details: {context.Exception}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"✅ JWT Token Validated Successfully");
                var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"🔍 Authenticated User ID: {userId}");

                // Log all claims for debugging
                Console.WriteLine($"🔍 All claims in token:");
                if (context.Principal?.Claims != null)
                {
                    foreach (var claim in context.Principal.Claims)
                    {
                        Console.WriteLine($"  - {claim.Type}: {claim.Value}");
                    }
                }

                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"🔍 JWT Challenge issued: {context.Error}, {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Taskly API V1");
    c.DocumentTitle = "Taskly API - Auto-Authenticated";
});

// Use CORS before other middleware
app.UseCors("AllowFrontend");

// Add CORS request logging middleware
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        Console.WriteLine($"🔍 CORS Preflight Request: {context.Request.Method} {context.Request.Path}");
        Console.WriteLine($"🔍 Origin: {context.Request.Headers["Origin"]}");
        Console.WriteLine($"🔍 Access-Control-Request-Method: {context.Request.Headers["Access-Control-Request-Method"]}");
        Console.WriteLine($"🔍 Access-Control-Request-Headers: {context.Request.Headers["Access-Control-Request-Headers"]}");
    }

    await next();

    if (context.Request.Method == "OPTIONS")
    {
        Console.WriteLine($"🔍 CORS Response Headers:");
        foreach (var header in context.Response.Headers)
        {
            Console.WriteLine($"  - {header.Key}: {header.Value}");
        }
    }
});

app.UseHttpsRedirection();
app.UseStaticFiles(); // Enable serving static files
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DataSeeder.SeedAsync(context, passwordHasher);
}

app.Run();
