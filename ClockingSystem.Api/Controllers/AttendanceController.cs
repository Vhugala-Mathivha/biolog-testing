using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ClockingSystem.Api.DTOs;

namespace ClockingSystem.Api.Controllers; // This line prevents the CS8802 error

[ApiController]
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _db;
    public AttendanceController(AppDbContext db) => _db = db;

    // Clock-in: creates (or resumes) a work session for the employee.
    // The current time is saved as StartTime.
    [HttpPost("clock-in/{empNo}")]
    public async Task<IActionResult> ClockIn(string empNo)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null || !employee.IsActive) return NotFound("Employee not found or inactive.");

        // Check if there is already an open session (clocked in but not clocked out)
        var openSession = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == empNo && l.EndTime == null)
            .OrderByDescending(l => l.StartTime)
            .FirstOrDefaultAsync();

        if (openSession != null)
            return BadRequest("Employee is already clocked in.");

        var now = DateTime.UtcNow;

        var log = new AttendanceLog
        {
            EmployeeNumber = empNo,
            StartTime = now,
            EndTime = null,
            Duration = null,
            Status = "Present"
        };

        _db.AttendanceLogs.Add(log);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            employeeNumber = empNo,
            type = "CLOCK_IN",
            clockInTime = now,
            status = log.Status
        });
    }

    // Clock-out: finds the open session for the employee and sets EndTime to
    // the current time, calculates the duration, and updates the status.
    [HttpPost("clock-out/{empNo}")]
    public async Task<IActionResult> ClockOut(string empNo)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null) return NotFound("Employee not found.");

        // Find the open session (clocked in but not clocked out)
        var openSession = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == empNo && l.EndTime == null)
            .OrderByDescending(l => l.StartTime)
            .FirstOrDefaultAsync();

        if (openSession == null)
            return BadRequest("No open clock-in session found. Please clock in first.");

        var now = DateTime.UtcNow;

        // Save the end time
        openSession.EndTime = now;

        // Calculate the duration between start and end times
        openSession.Duration = now - openSession.StartTime!.Value;

        // Determine final status
        // If the employee worked less than 1 minute, treat as invalid;
        // otherwise mark as "Present"
        if (openSession.Duration.Value.TotalMinutes < 1)
            openSession.Status = "Invalid";
        else
            openSession.Status = "Present";

        _db.AttendanceLogs.Update(openSession);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            employeeNumber = empNo,
            type = "CLOCK_OUT",
            clockInTime = openSession.StartTime,
            clockOutTime = openSession.EndTime,
            duration = FormatDuration(openSession.Duration.Value),
            status = openSession.Status
        });
    }

    // Face-recognition clock-in: identifies the employee by face vector and
    // records the clock-in with the current time as StartTime.
    [HttpPost("identify-and-clock")]
    public async Task<IActionResult> IdentifyAndClock([FromBody] IdentifyRequest req)
    {
        if (req == null || req.Vector == null || req.Vector.Length != 128)
            return BadRequest("Invalid face vector data. Must be 128 floats.");

        // Convert the array to a string format pgvector understands: "[0.1, 0.2, ...]"
        var vectorString = "[" + string.Join(",", req.Vector) + "]";

        // Query the 'employee' table (lowercase) as seen in your database screenshot
        // We look for the closest match within a 0.6 distance threshold
        var employee = await _db.Employees
            .FromSqlRaw(@"
                SELECT * FROM employee 
                WHERE facevector <-> {0}::vector < 0.6 
                ORDER BY facevector <-> {0}::vector ASC 
                LIMIT 1", vectorString)
            .FirstOrDefaultAsync();

        if (employee == null)
            return NotFound("Face not recognized.");

        // Check if there's already an open session (clocked in but not clocked out).
        // If so, this scan closes that session (CLOCK_OUT). Otherwise it records
        // a new CLOCK_IN session - preserving the original toggle behaviour.
        var openSession = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == employee.EmployeeNumber && l.EndTime == null)
            .OrderByDescending(l => l.StartTime)
            .FirstOrDefaultAsync();

        if (openSession != null)
        {
            var clockOutTime = DateTime.UtcNow;
            openSession.EndTime = clockOutTime;
            openSession.Duration = clockOutTime - openSession.StartTime!.Value;

            // If the employee worked less than 1 minute, treat as invalid;
            // otherwise mark as "Present"
            if (openSession.Duration.Value.TotalMinutes < 1)
                openSession.Status = "Invalid";
            else
                openSession.Status = "Present";

            _db.AttendanceLogs.Update(openSession);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                name = $"{employee.FirstName} {employee.LastName}",
                employeeNumber = employee.EmployeeNumber,
                type = "CLOCK_OUT",
                clockInTime = openSession.StartTime,
                clockOutTime = openSession.EndTime,
                duration = FormatDuration(openSession.Duration.Value),
                status = openSession.Status
            });
        }

        // Record the Clock-In with the current time as StartTime
        var log = new AttendanceLog
        {
            EmployeeNumber = employee.EmployeeNumber,
            StartTime = DateTime.UtcNow,
            EndTime = null,
            Duration = null,
            Status = "Present"
        };

        _db.AttendanceLogs.Add(log);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            name = $"{employee.FirstName} {employee.LastName}",
            employeeNumber = employee.EmployeeNumber,
            type = "CLOCK_IN",
            clockInTime = log.StartTime,
            status = log.Status
        });
    }

    // History for a single employee (most recent sessions first)
    [HttpGet("{empNo}")]
    public async Task<IActionResult> History(string empNo)
    {
        var logs = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == empNo)
            .OrderByDescending(l => l.StartTime)
            .ToListAsync();

        var result = logs.Select(l => new
        {
            id = l.Id,
            employeeNumber = l.EmployeeNumber,
            clockInTime = l.StartTime,
            clockOutTime = l.EndTime,
            duration = l.Duration.HasValue ? FormatDuration(l.Duration.Value) : null,
            status = l.Status
        });

        return Ok(result);
    }

    private static string FormatDuration(TimeSpan span)
    {
        return $"{(int)span.TotalHours}h {span.Minutes}m";
    }
}