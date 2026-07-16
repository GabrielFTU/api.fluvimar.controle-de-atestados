using api.fluvimar.controle_de_atestados_ddd.Controllers.Extensions;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AutenticacaoController : ControllerBase
{
    private readonly IAutenticacaoServico _autenticacaoServico;

    public AutenticacaoController(IAutenticacaoServico autenticacaoServico)
    {
        _autenticacaoServico = autenticacaoServico;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UsuarioDTO.LoginResponse>> Login(UsuarioDTO.LoginRequest dto) =>
        Ok(await _autenticacaoServico.LoginAsync(dto));

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UsuarioDTO.UsuarioResponse>> Me() =>
        Ok(await _autenticacaoServico.ObterUsuarioAtualAsync(Guid.Parse(this.UsuarioId())));
}
