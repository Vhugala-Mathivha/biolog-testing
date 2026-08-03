using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public record LoginRequest(string EmployeeNumber, string Password);
public record SetPasswordRequest(string EmployeeNumber, string IdNumber, string Password, string ConfirmPassword);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmNewPassword);
public record UpdateProfileRequest(string FullName);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    public AuthController(AppDbContext db, IConfiguration config) { _db = db; _config = config; }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        // FIX: was looking up by FullName, now looks up by EmployeeNumber to match
        // the frontend login page (Employee Number + Password only).
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.EmployeeNumber == req.EmployeeNumber);

        if (admin == null || !admin.IsActivated)
            return Unauthorized("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(req.Password, admin.PasswordHash))
            return Unauthorized("Invalid credentials.");

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, admin.EmployeeNumber!),
            new Claim("fullName", admin.FullName),
            new Claim(ClaimTypes.Role, admin.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            employeeNumber = admin.EmployeeNumber,
            fullName = admin.FullName,
            role = admin.Role
        });
    }

    // Activates a PENDING HR invite. A Superadmin must have already created the
    // pending Admin row via POST /api/employees/{employeeNumber}/promote-to-hr.
    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword(SetPasswordRequest req)
    {
        if (req.Password != req.ConfirmPassword)
            return BadRequest("Passwords do not match.");

        var employee = await _db.Employees.FirstOrDefaultAsync(e => e.EmployeeNumber == req.EmployeeNumber);
        if (employee == null || employee.IdNumber != req.IdNumber)
            return BadRequest("Employee number and ID number do not match our records.");

        var pendingAdmin = await _db.Admins.FirstOrDefaultAsync(a => a.EmployeeNumber == req.EmployeeNumber);
        if (pendingAdmin == null)
            return BadRequest("No pending HR invite found for this employee.");

        if (pendingAdmin.IsActivated)
            return BadRequest("This account is already activated. Use login instead.");

        pendingAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
        pendingAdmin.IsActivated = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Account activated. You can now log in." });
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req)
    {
        if (req.NewPassword != req.ConfirmNewPassword)
            return BadRequest("New passwords do not match.");

        var employeeNumber = User.Identity?.Name;
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.EmployeeNumber == employeeNumber);

        if (admin == null || !BCrypt.Net.BCrypt.Verify(req.CurrentPassword, admin.PasswordHash))
            return Unauthorized("Current password is incorrect.");

        admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password updated." });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest req)
    {
        var employeeNumber = User.Identity?.Name;
        var admin = await _db.Admins.FirstOrDefaultAsync(a => a.EmployeeNumber == employeeNumber);
        if (admin == null) return NotFound();

        admin.FullName = req.FullName;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Profile updated." });
    }
}