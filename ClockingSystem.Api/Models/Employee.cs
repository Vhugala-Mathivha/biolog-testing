using Pgvector;

public class Employee
{
    public string EmployeeNumber { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string IdNumber { get; set; } = null!;
    public string? Position { get; set; }
    public string? Department { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? Gender { get; set; }
    public Vector? FaceVector { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}