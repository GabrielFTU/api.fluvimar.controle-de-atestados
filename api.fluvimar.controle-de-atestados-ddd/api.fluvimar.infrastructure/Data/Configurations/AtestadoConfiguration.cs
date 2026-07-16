using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.fluvimar.infrastructure.Data.Configurations;

public sealed class AtestadoConfiguration : IEntityTypeConfiguration<AtestadoEntity>
{
    public void Configure(EntityTypeBuilder<AtestadoEntity> builder)
    {
        builder.ToTable("Atestados");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.CodigoInterno)
            .ValueGeneratedOnAdd();

        builder.Property(a => a.NomeFuncionario)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.CID)
            .HasMaxLength(6);

        builder.Property(a => a.DiaAfastamento)
            .HasColumnType("timestamp without time zone");

        builder.Property(a => a.DiaRetorno)
            .HasColumnType("timestamp without time zone");

        builder.Property(a => a.Observacoes)
            .HasMaxLength(500);

        builder.Property(a => a.NomeMedico)
            .HasMaxLength(255);

        builder.Ignore(a => a.TotalDiasFora);
        builder.Ignore(a => a.TotalHoras);

        builder.HasOne(a => a.Funcionario)
            .WithMany()
            .HasForeignKey(a => a.FuncionarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Medico)
            .WithMany()
            .HasForeignKey(a => a.MedicoId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
