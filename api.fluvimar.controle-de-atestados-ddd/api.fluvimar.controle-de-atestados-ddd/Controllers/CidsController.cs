using api.fluvimar.domain.DTO;
using api.fluvimar.domain.Interfaces.Servicos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class CidsController : ControllerBase
{
    private readonly ICidServico _cidServico;

    public CidsController(ICidServico cidServico)
    {
        _cidServico = cidServico;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CidDTO.CidResponse>>> Buscar([FromQuery] string? termo) =>
        Ok(await _cidServico.BuscarAsync(termo ?? string.Empty));
}
