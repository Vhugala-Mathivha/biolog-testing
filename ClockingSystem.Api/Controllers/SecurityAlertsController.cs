using Microsoft.AspNetCore.Mvc;

public record CreateAlertRequest(string? EmployeeNumber, string AlertType, string? Message, string? SnapshotUrl);

[ApiController]
[Route("api/security-alerts")]
public class SecurityAlertsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SecurityAlertsController(AppDbContext db) => _db = db;

    [HttpPost]
    public async Task<IActionResult> Create(CreateAlertRequest req)
    {
        var alert = new SecurityAlert
        {
            EmployeeNumber = req.EmployeeNumber,
            AlertType = req.AlertType,
            Message = req.Message,
            SnapshotUrl = req.SnapshotUrl,
            CreatedAt = DateTime.UtcNow
        };
        _db.SecurityAlerts.Add(alert);
        await _db.SaveChangesAsync();
        return Ok(alert);
    }
}