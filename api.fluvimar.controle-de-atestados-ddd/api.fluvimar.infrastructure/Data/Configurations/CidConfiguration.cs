using api.fluvimar.domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.fluvimar.infrastructure.Data.Configurations;

public sealed class CidConfiguration : IEntityTypeConfiguration<CidEntity>
{
    public void Configure(EntityTypeBuilder<CidEntity> builder)
    {
        builder.ToTable("Cids");
        builder.HasKey(c => c.Codigo);

        builder.Property(c => c.Codigo)
            .HasMaxLength(6)
            .IsRequired();

        builder.Property(c => c.Descricao)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(c => c.Busca)
            .HasMaxLength(520)
            .IsRequired();

        builder.HasIndex(c => c.Busca);
    }
}
