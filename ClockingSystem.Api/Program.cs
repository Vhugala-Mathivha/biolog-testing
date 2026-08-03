using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Npgsql: Handle timestamp without time zone columns (used in attendancelog)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("A PostgreSQL connection string is required. Set ConnectionStrings:DefaultConnection or DATABASE_URL.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseVector()));

var frontendOrigin = builder.Configuration["Frontend:Origin"]
    ?? Environment.GetEnvironmentVariable("FRONTEND_ORIGIN")
    ?? "https://bio-log-virid.vercel.app";

// UPDATED: CORS whitelist includes production Vercel URLs, the
// configured Frontend:Origin, and local development origins.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercel",
        policy => policy.WithOrigins(
                            "https://biolog-face-recognition.vercel.app", 
                            "https://biolog-face-recognition-gamma.vercel.app",
                            frontendOrigin,
                            "http://localhost:3001",
                            "http://localhost:3000",
                            "http://localhost:5173",
                            "http://127.0.0.1:3000",
                            "http://127.0.0.1:5173"
                         ) 
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? Environment.GetEnvironmentVariable("JWT_KEY")
    ?? "ThisIsASecretKeyForDevelopmentPurposesOnly123!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? "ClockingSystem";
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? "ClockingSystemUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Ensure CORS is applied before Authentication and Authorization
app.UseCors("AllowVercel");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => "Home GET Request");
app.MapGet("/api/health", async (AppDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new { status = canConnect ? "ok" : "degraded", database = canConnect ? "connected" : "disconnected" });
    }
    catch (Exception ex)
    {
        return Results.Json(new { status = "error", database = "disconnected", message = ex.Message }, statusCode: 503);
    }
});

app.Run();