using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.fluvimar.infrastructure.Data.Configurations;

public sealed class MedicoConfiguration : IEntityTypeConfiguration<MedicoEntity>
{
    public void Configure(EntityTypeBuilder<MedicoEntity> builder)
    {
        builder.ToTable("Medicos");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.CodigoInterno)
            .ValueGeneratedOnAdd();

        builder.Property(m => m.Nome)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(m => m.Crm)
            .HasMaxLength(20);
    }
}
