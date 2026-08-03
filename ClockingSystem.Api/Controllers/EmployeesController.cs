using ClockingSystem.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Pgvector;

namespace ClockingSystem.Api.Controllers;

[ApiController]
[Route("api/employees")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmployeesController(AppDbContext db) => _db = db;

    [HttpPost("identify-and-clock")]
    public async Task<IActionResult> IdentifyAndClock([FromBody] IdentifyRequest req)
    {
        if (req.Vector == null || req.Vector.Length != 128)
            return BadRequest("Invalid face vector data.");

        var vectorString = "[" + string.Join(",", req.Vector) + "]";

        // Query the 'employee' table for the closest matching face (128-dimensional vectors).
        // The <-> operator computes the L2 distance between vectors.
        var employee = await _db.Employees
            .FromSqlRaw(@"
                SELECT * FROM employee 
                WHERE facevector IS NOT NULL AND facevector <-> {0}::vector(128) < 0.6 
                ORDER BY facevector <-> {0}::vector(128) ASC 
                LIMIT 1", vectorString)
            .FirstOrDefaultAsync();

        if (employee == null)
            return NotFound("Face not recognized.");

        // Check if there's already an open session (clocked in but not clocked out)
        var existingOpen = await _db.AttendanceLogs
            .Where(l => l.EmployeeNumber == employee.EmployeeNumber && l.EndTime == null)
            .FirstOrDefaultAsync();

        if (existingOpen != null)
            return BadRequest("Employee is already clocked in.");

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

        return Ok(new { 
            name = $"{employee.FirstName} {employee.LastName}", 
            employeeNumber = employee.EmployeeNumber,
            clockInTime = log.StartTime,
            status = log.Status
        });
    }

    [Authorize(Roles = "Superadmin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterEmployeeRequest req)
    {
        if (await _db.Employees.AnyAsync(e => e.EmployeeNumber == req.EmployeeNumber))
            return Conflict("Employee number already exists.");

        var employee = new Employee
        {
            EmployeeNumber = req.EmployeeNumber,
            FirstName = req.FirstName,
            LastName = req.LastName,
            IdNumber = req.IdNumber,
            Position = req.Position,
            Department = req.Department,
            ContactNumber = req.ContactNumber,
            Email = req.Email,
            Gender = req.Gender,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Employees.Add(employee);
        await _db.SaveChangesAsync();

        return Ok(new EmployeeResponse(employee.EmployeeNumber, employee.FirstName,
            employee.LastName, employee.Department, employee.IsActive, null));
    }

    [Authorize(Roles = "Superadmin")]
    [HttpPost("{empNo}/face-vector")]
    public async Task<IActionResult> SetFaceVector(string empNo, [FromBody] IdentifyRequest req)
    {
        if (req == null || req.Vector == null || req.Vector.Length != 128)
            return BadRequest("Invalid face vector data. Must be 128 floats.");

        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null) return NotFound("Employee not found.");

        employee.FaceVector = new Vector(req.Vector);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Face vector saved." });
    }

    [HttpGet("{empNo}")]
    public async Task<IActionResult> Get(string empNo)
    {
        var e = await _db.Employees.FindAsync(empNo);
        if (e == null) return NotFound();
        return Ok(new EmployeeResponse(e.EmployeeNumber, e.FirstName, e.LastName, e.Department, e.IsActive, e.FaceVector?.ToArray()));
    }

    [Authorize(Roles = "Superadmin,HR")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var employees = await _db.Employees.ToListAsync();
        var admins = await _db.Admins.ToListAsync();

        var result = employees.Select(e =>
        {
            var adminRow = admins.FirstOrDefault(a => a.EmployeeNumber == e.EmployeeNumber);
            var portalRole = adminRow == null ? "Employee" : (adminRow.IsActivated ? adminRow.Role : "Pending");

            return new EmployeeListItem(e.EmployeeNumber, e.FirstName, e.LastName,
                e.ContactNumber, e.Email, e.IsActive, portalRole, e.FaceVector?.ToArray());
        }).ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Superadmin")]
    [HttpPut("{empNo}")]
    public async Task<IActionResult> Update(string empNo, UpdateEmployeeRequest req)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null) return NotFound();

        employee.FirstName = req.FirstName;
        employee.LastName = req.LastName;
        employee.Position = req.Position;
        employee.Department = req.Department;
        employee.ContactNumber = req.ContactNumber;
        employee.Email = req.Email;
        employee.Gender = req.Gender;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Employee updated." });
    }

    [Authorize(Roles = "Superadmin")]
    [HttpDelete("{empNo}")]
    public async Task<IActionResult> Delete(string empNo)
    {
        var employee = await _db.Employees.FindAsync(empNo);
        if (employee == null) return NotFound();

        var adminRow = await _db.Admins.FirstOrDefaultAsync(a => a.EmployeeNumber == empNo);
        if (adminRow != null) _db.Admins.Remove(adminRow);

        _db.Employees.Remove(employee);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Employee deleted." });
    }
    
    // ... rest of your PromoteToHr logic ...
}