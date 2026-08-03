namespace ClockingSystem.Api.DTOs;

public record EmployeeListItem(string EmployeeNumber, string FirstName, string LastName,
    string? ContactNumber, string? Email, bool IsActive, string PortalRole, float[]? FaceVector);

public record EmployeeResponse(string EmployeeNumber, string FirstName, string LastName, 
    string? Department, bool IsActive, float[]? FaceVector);

public record UpdateEmployeeRequest(string FirstName, string LastName, string? Position,
    string? Department, string? ContactNumber, string? Email, string? Gender);

public record RegisterEmployeeRequest(string EmployeeNumber, string FirstName, string LastName, 
    string IdNumber, string? Position, string? Department, string? ContactNumber, 
    string? Email, string? Gender);

public record FaceVerificationRequest(float[] Vector, double Threshold);

public record FaceVerificationResponse(string EmployeeNumber, double Similarity, bool Matched);

// Ensure this is here
public record IdentifyRequest(float[] Vector);