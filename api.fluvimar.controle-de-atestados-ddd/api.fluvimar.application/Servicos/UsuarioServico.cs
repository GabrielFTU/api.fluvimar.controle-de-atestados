using api.fluvimar.application.Seguranca;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;

namespace api.fluvimar.application.Servicos;

public sealed class UsuarioServico : IUsuarioServico
{
    private readonly IUsuarioRepositorio _usuarioRepositorio;

    public UsuarioServico(IUsuarioRepositorio usuarioRepositorio)
    {
        _usuarioRepositorio = usuarioRepositorio;
    }

    public async Task<IEnumerable<UsuarioDTO.UsuarioResponse>> ObterTodosAsync()
    {
        var usuarios = await _usuarioRepositorio.ObterTodosAsync();
        return usuarios.Select(MapearParaResponse);
    }

    public async Task<UsuarioDTO.UsuarioResponse> AdicionarAsync(UsuarioDTO.UsuarioCriarRequest dto, string userId)
    {
        var existente = await _usuarioRepositorio.ObterPorEmailAsync(dto.Email);
        if (existente is not null)
            throw new ArgumentException("Já existe um usuário cadastrado com este e-mail.");

        var usuario = new Usuario(userId);
        usuario.SetNome(dto.Nome);
        usuario.SetEmail(dto.Email);
        usuario.SetSenhaHash(SenhaHasher.Hash(dto.Senha));
        usuario.SetIsAdmin(dto.IsAdmin);

        await _usuarioRepositorio.AdicionarAsync(usuario);

        return MapearParaResponse(usuario);
    }

    public async Task AtivarAsync(Guid id, string userId)
    {
        var usuario = await _usuarioRepositorio.ObterPorIdAsync(id);
        usuario.Activate(userId);
        await _usuarioRepositorio.AtualizarAsync(usuario);
    }

    public async Task DesativarAsync(Guid id, string userId)
    {
        var usuario = await _usuarioRepositorio.ObterPorIdAsync(id);
        usuario.Deactivate(userId);
        await _usuarioRepositorio.AtualizarAsync(usuario);
    }

    private static UsuarioDTO.UsuarioResponse MapearParaResponse(Usuario usuario) =>
        new()
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            IsAdmin = usuario.IsAdmin,
            IsActive = usuario.IsActive,
        };
}
