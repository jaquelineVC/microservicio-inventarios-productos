using Inventarios.api.Domain.Entities;
using Inventarios.api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Inventarios.api.Infraestructure.Context;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id)
                .HasColumnName("id")
                .HasColumnType("char(36)");

            entity.Property(u => u.Name)
                .HasColumnName("name")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(u => u.Email)
                .HasColumnName("email")
                .HasMaxLength(254)
                .IsRequired();

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(u => u.Role)
                .HasColumnName("role")
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(u => u.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);

            entity.Property(u => u.CreatedAt)
                .HasColumnName("created_at");

            entity.Property(u => u.LastLoginAt)
                .HasColumnName("last_login_at")
                .IsRequired(false);

            entity.Property(u => u.FailedLoginAttempts)
                .HasColumnName("failed_login_attempts")
                .HasDefaultValue(0);

            entity.Property(u => u.LockedUntil)
                .HasColumnName("locked_until")
                .IsRequired(false);
        });
    }
}