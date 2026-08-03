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

    [HttpPost("identify-and-clock")]
    public async Task<IActionResult> IdentifyAndClock([FromBody] IdentifyRequest req)
    {
        if (req == null || req.Vector == null || req.Vector.Length != 128)
            return BadRequest("Invalid face vector data.");

        var vectorString = "[" + string.Join(",", req.Vector) + "]";

        try 
        {
            var employee = await _db.Employees
                .FromSqlRaw(@"
                    SELECT * FROM ""Employee"" 
                    WHERE ""FaceVector"" IS NOT NULL AND ""FaceVector"" <-> {0}::vector < 0.6 
                    ORDER BY ""FaceVector"" <-> {0}::vector ASC 
                    LIMIT 1", vectorString)
                .FirstOrDefaultAsync();

            if (employee == null)
                return NotFound("Face not recognized.");

            var openSession = await _db.AttendanceLogs
                .Where(l => l.EmployeeNumber == employee.EmployeeNumber && l.EndTime == null)
                .OrderByDescending(l => l.StartTime)
                .FirstOrDefaultAsync();

            if (openSession != null)
            {
                var clockOutTime = DateTime.UtcNow;
                openSession.EndTime = clockOutTime;
                openSession.Duration = clockOutTime - openSession.StartTime!.Value;
                openSession.Status = openSession.Duration.Value.TotalMinutes < 1 ? "Invalid" : "Present";

                _db.AttendanceLogs.Update(openSession);
                await _db.SaveChangesAsync();

                return Ok(new { name = $"{employee.FirstName} {employee.LastName}", employeeNumber = employee.EmployeeNumber, type = "CLOCK_OUT" });
            }

            var log = new AttendanceLog { EmployeeNumber = employee.EmployeeNumber, StartTime = DateTime.UtcNow, Status = "Present" };
            _db.AttendanceLogs.Add(log);
            await _db.SaveChangesAsync();

            return Ok(new { name = $"{employee.FirstName} {employee.LastName}", employeeNumber = employee.EmployeeNumber, type = "CLOCK_IN" });
        }
        catch (System.Exception ex) {
            return StatusCode(500, $"Internal error: {ex.Message}");
        }
    }

    [HttpPost("clock-in/{empNo}")]
    public async Task<IActionResult> ClockIn(string empNo)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null || !employee.IsActive) return NotFound("Employee not found.");
        var log = new AttendanceLog { EmployeeNumber = empNo, StartTime = DateTime.UtcNow, Status = "Present" };
        _db.AttendanceLogs.Add(log);
        await _db.SaveChangesAsync();
        return Ok(new { employeeNumber = empNo, type = "CLOCK_IN" });
    }

    [HttpPost("clock-out/{empNo}")]
    public async Task<IActionResult> ClockOut(string empNo)
    {
        var log = await _db.AttendanceLogs.Where(l => l.EmployeeNumber == empNo && l.EndTime == null).FirstOrDefaultAsync();
        if (log == null) return BadRequest("Not clocked in.");
        log.EndTime = DateTime.UtcNow;
        _db.AttendanceLogs.Update(log);
        await _db.SaveChangesAsync();
        return Ok(new { employeeNumber = empNo, type = "CLOCK_OUT" });
    }
}