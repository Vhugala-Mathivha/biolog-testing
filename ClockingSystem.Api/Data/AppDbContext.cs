using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<AttendanceLog> AttendanceLogs => Set<AttendanceLog>();
    public DbSet<SecurityAlert> SecurityAlerts => Set<SecurityAlert>();
    public DbSet<Admin> Admins => Set<Admin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Employee>(entity =>
    {
        entity.ToTable("employee");
        entity.HasKey(e => e.EmployeeNumber);
    });

    modelBuilder.Entity<AttendanceLog>().ToTable("attendancelog");
    modelBuilder.Entity<SecurityAlert>().ToTable("securityalert");
    modelBuilder.Entity<Admin>().ToTable("admin");

    foreach (var entity in modelBuilder.Model.GetEntityTypes())
        foreach (var property in entity.GetProperties())
            property.SetColumnName(property.GetColumnName().ToLower());
}
}