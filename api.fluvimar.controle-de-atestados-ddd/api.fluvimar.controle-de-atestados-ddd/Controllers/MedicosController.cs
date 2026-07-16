using api.fluvimar.controle_de_atestados_ddd.Controllers.Extensions;
using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class MedicosController : ControllerBase
{
    private readonly IMedicoServico _medicoServico;

    public MedicosController(IMedicoServico medicoServico)
    {
        _medicoServico = medicoServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MedicoDTO.MedicoResponse>>> ObterTodos() =>
        Ok(await _medicoServico.ObterTodosAsync());

    [HttpPost]
    public async Task<ActionResult<MedicoDTO.MedicoResponse>> Adicionar(MedicoDTO.MedicoRequest dto)
    {
        var response = await _medicoServico.AdicionarAsync(dto, this.UsuarioId());
        return StatusCode(StatusCodes.Status201Created, response);
    }
}
