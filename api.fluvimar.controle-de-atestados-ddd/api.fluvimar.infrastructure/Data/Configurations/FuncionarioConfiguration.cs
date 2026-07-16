using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.fluvimar.infrastructure.Data.Configurations;

public sealed class FuncionarioConfiguration : IEntityTypeConfiguration<Funcionario>
{
    public void Configure(EntityTypeBuilder<Funcionario> builder)
    {
        builder.ToTable("Funcionarios");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.CodigoInterno)
            .ValueGeneratedOnAdd();

        builder.Property(f => f.Nome)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasOne(f => f.Setor)
            .WithMany()
            .HasForeignKey(f => f.SetorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
