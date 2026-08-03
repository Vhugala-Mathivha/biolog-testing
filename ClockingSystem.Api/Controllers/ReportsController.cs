using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

public record EmployeeDailyStatus(string EmployeeNumber, string FullName,
    DateTime? ClockInTime, DateTime? ClockOutTime, string Status, string? Duration);

public record HrDashboardSummary(int TotalEmployees, int PresentCount, int LateCount,
    int AbsentCount, List<EmployeeDailyStatus> Employees);

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "HR,Superadmin")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReportsController(AppDbContext db) => _db = db;

    [HttpGet("organisation")]
    public async Task<IActionResult> OrganisationReport()
    {
        var report = await _db.Employees
            .GroupBy(e => e.Department)
            .Select(g => new { Department = g.Key, EmployeeCount = g.Count() })
            .ToListAsync();
        return Ok(report);
    }

    // HR Dashboard summary — total/present/late/absent counts plus per-employee
    // clock in, clock out, status, and duration for a given day. Defaults to today.
    [HttpGet("hr-summary")]
    public async Task<IActionResult> GetHrSummary([FromQuery] DateOnly? date)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var dayStart = DateTime.SpecifyKind(targetDate.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var dayEnd = dayStart.AddDays(1);

        var employees = await _db.Employees.Where(e => e.IsActive).ToListAsync();

        // Get attendance sessions that started on the target day
        var sessions = await _db.AttendanceLogs
            .Where(l => l.StartTime != null && l.StartTime >= dayStart && l.StartTime < dayEnd)
            .ToListAsync();

        var statuses = new List<EmployeeDailyStatus>();

        foreach (var e in employees)
        {
            var session = sessions
                .Where(l => l.EmployeeNumber == e.EmployeeNumber)
                .OrderByDescending(l => l.StartTime)
                .FirstOrDefault();

            string status;
            string? duration = null;

            if (session == null)
            {
                // No session started that day — treat as absent
                status = "Absent";
            }
            else
            {
                status = session.Status;

                // If there's a finish time, the duration is already stored.
                // If not, show in-progress duration.
                if (session.EndTime.HasValue && session.Duration.HasValue)
                {
                    duration = FormatDuration(session.Duration.Value);
                }
                else if (session.EndTime == null)
                {
                    // Still clocked in — show running duration
                    var running = DateTime.UtcNow - session.StartTime!.Value;
                    duration = FormatDuration(running);
                    status = "In Progress";
                }
            }

            statuses.Add(new EmployeeDailyStatus(
                e.EmployeeNumber,
                $"{e.FirstName} {e.LastName}",
                session?.StartTime,
                session?.EndTime,
                status,
                duration));
        }

        var summary = new HrDashboardSummary(
            TotalEmployees: employees.Count,
            PresentCount: statuses.Count(s => s.Status == "Present"),
            LateCount: statuses.Count(s => s.Status == "Late"),
            AbsentCount: statuses.Count(s => s.Status == "Absent"),
            Employees: statuses);

        return Ok(summary);
    }

    // Per-employee history — powers the "view" action next to each row in the
    // HR list. Defaults to the last 30 days.
    [HttpGet("hr-summary/{empNo}")]
    public async Task<IActionResult> GetEmployeeHistory(string empNo, [FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null) return NotFound();

        var fromDate = DateTime.SpecifyKind((from ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30))).ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var toDate = DateTime.SpecifyKind((to ?? DateOnly.FromDateTime(DateTime.UtcNow)).ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);

        var sessions = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == empNo &&
                        l.StartTime != null &&
                        l.StartTime >= fromDate &&
                        l.StartTime <= toDate)
            .OrderBy(l => l.StartTime)
            .ToListAsync();

        var days = sessions.Select(s =>
        {
            string? duration = null;
            if (s.Duration.HasValue)
            {
                duration = FormatDuration(s.Duration.Value);
            }
            else if (s.EndTime == null)
            {
                // Still in progress
                var running = DateTime.UtcNow - s.StartTime!.Value;
                duration = FormatDuration(running);
            }

            return new EmployeeDailyStatus(
                employee.EmployeeNumber,
                $"{employee.FirstName} {employee.LastName}",
                s.StartTime,
                s.EndTime,
                s.Status,
                duration);
        }).ToList();

        return Ok(days);
    }

    private static string FormatDuration(TimeSpan span)
    {
        return $"{(int)span.TotalHours}h {span.Minutes}m";
    }
}