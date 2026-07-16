using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.fluvimar.application.Seguranca;
using api.fluvimar.domain.Classes;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace api.fluvimar.application.Servicos;

public sealed class AutenticacaoServico : IAutenticacaoServico
{
    private readonly IUsuarioRepositorio _usuarioRepositorio;
    private readonly JwtOptions _jwtOptions;

    public AutenticacaoServico(IUsuarioRepositorio usuarioRepositorio, IOptions<JwtOptions> jwtOptions)
    {
        _usuarioRepositorio = usuarioRepositorio;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<UsuarioDTO.LoginResponse> LoginAsync(UsuarioDTO.LoginRequest dto)
    {
        var usuario = await _usuarioRepositorio.ObterPorEmailAsync(dto.Email);
        if (usuario is null || !usuario.IsActive || !SenhaHasher.Verificar(dto.Senha, usuario.SenhaHash))
            throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        var (token, expiraEm) = GerarToken(usuario);

        return new UsuarioDTO.LoginResponse
        {
            Token = token,
            ExpiraEm = expiraEm,
            Usuario = MapearParaResponse(usuario),
        };
    }

    public async Task<UsuarioDTO.UsuarioResponse> ObterUsuarioAtualAsync(Guid usuarioId)
    {
        var usuario = await _usuarioRepositorio.ObterPorIdAsync(usuarioId);
        return MapearParaResponse(usuario);
    }

    private (string Token, DateTime ExpiraEm) GerarToken(Usuario usuario)
    {
        var expiraEm = DateTime.UtcNow.AddMinutes(_jwtOptions.AcessTokenExpirationMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim("isAdmin", usuario.IsAdmin ? "true" : "false"),
        };

        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecurityKey));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiraEm,
            signingCredentials: credenciais);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
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
