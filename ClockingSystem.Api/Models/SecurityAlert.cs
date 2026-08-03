public class SecurityAlert
{
    public int Id { get; set; }
    public string? EmployeeNumber { get; set; }
    public string AlertType { get; set; } = null!;
    public string? Message { get; set; }
    public string? SnapshotUrl { get; set; }
    public bool IsResolved { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}