public class Admin
{
    public int Id { get; set; }
    public string? EmployeeNumber { get; set; }
    public string PasswordHash { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public bool IsActivated { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}