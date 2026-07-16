using api.fluvimar.controle_de_atestados_ddd.Controllers.Extensions;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public sealed class UsuariosController : ControllerBase
{
    private readonly IUsuarioServico _usuarioServico;

    public UsuariosController(IUsuarioServico usuarioServico)
    {
        _usuarioServico = usuarioServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDTO.UsuarioResponse>>> ObterTodos() =>
        Ok(await _usuarioServico.ObterTodosAsync());

    [HttpPost]
    public async Task<ActionResult<UsuarioDTO.UsuarioResponse>> Adicionar(UsuarioDTO.UsuarioCriarRequest dto)
    {
        var response = await _usuarioServico.AdicionarAsync(dto, this.UsuarioId());
        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpPatch("{id:guid}/ativar")]
    public async Task<IActionResult> Ativar(Guid id)
    {
        await _usuarioServico.AtivarAsync(id, this.UsuarioId());
        return NoContent();
    }

    [HttpPatch("{id:guid}/desativar")]
    public async Task<IActionResult> Desativar(Guid id)
    {
        await _usuarioServico.DesativarAsync(id, this.UsuarioId());
        return NoContent();
    }
}
