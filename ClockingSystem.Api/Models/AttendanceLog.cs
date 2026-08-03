public class AttendanceLog
{
    public int Id { get; set; }
    public string EmployeeNumber { get; set; } = null!;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public TimeSpan? Duration { get; set; }
    public string Status { get; set; } = "Absent";
    public int GracePeriodMins { get; set; } = 15;
}