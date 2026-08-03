using System;
using ClockingSystem.Api;
using Microsoft.EntityFrameworkCore;

var connectionString = "Host=biolog-project-biolog.b.aivencloud.com;Port=10052;Database=defaultdb;Username=avnadmin;Password=AVNS_XBxc0BD6myvpljM1YsG;SSL Mode=Require;Trust Server Certificate=true";

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseNpgsql(connectionString)
    .Options;

using (var db = new AppDbContext(options))
{
    try
    {
        Console.WriteLine("Connecting to database...");
        await db.Database.OpenConnectionAsync();
        Console.WriteLine("✓ Database connected");
        
        // Check current state
        Console.WriteLine("\nChecking vector dimensions...");
        var result = await db.Database.SqlQueryRaw<string>(
            @"SELECT 'Current state' as status;
              SELECT COUNT(*) as count FROM employee WHERE facevector IS NOT NULL;").ToListAsync();
        
        // Clear invalid vectors (not 128-dimensional)
        Console.WriteLine("Clearing invalid vectors...");
        var deletedCount = await db.Database.ExecuteSqlRawAsync(
            @"UPDATE employee 
              SET facevector = NULL 
              WHERE facevector IS NOT NULL 
              AND array_length(facevector::float8[], 1) != 128");
        
        Console.WriteLine($"✓ Cleared {deletedCount} invalid vector records");
        
        // Verify
        var validCount = await db.Database.SqlQueryRaw<int>(
            "SELECT COUNT(*) FROM employee WHERE facevector IS NOT NULL").ToListAsync();
        
        Console.WriteLine($"✓ {validCount.FirstOrDefault()} valid 128-dimensional vectors remaining");
        Console.WriteLine("\n✓ Database cleanup completed successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"✗ Error: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
    }
    finally
    {
        await db.Database.CloseConnectionAsync();
    }
}
