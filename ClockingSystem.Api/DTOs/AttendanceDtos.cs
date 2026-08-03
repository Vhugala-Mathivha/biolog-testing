public record ClockEventResponse(string EmployeeNumber, string LogType, DateTime Timestamp);
public record HoursWorkedResponse(string EmployeeNumber, DateTime Date, double HoursWorked);