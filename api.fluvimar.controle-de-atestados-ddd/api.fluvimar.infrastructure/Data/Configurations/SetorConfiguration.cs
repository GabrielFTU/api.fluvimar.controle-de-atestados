using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.fluvimar.infrastructure.Data.Configurations;

public sealed class SetorConfiguration : IEntityTypeConfiguration<SetorEntity>
{
    public void Configure(EntityTypeBuilder<SetorEntity> builder)
    {
        builder.ToTable("Setores");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CodigoInterno)
            .ValueGeneratedOnAdd();

        builder.Property(s => s.NomeDoSetor)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(s => s.Responsavel)
            .HasMaxLength(255);
    }
}
