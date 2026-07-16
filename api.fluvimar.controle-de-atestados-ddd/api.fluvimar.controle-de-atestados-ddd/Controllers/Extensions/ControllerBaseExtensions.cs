using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace api.fluvimar.controle_de_atestados_ddd.Controllers.Extensions;

public static class ControllerBaseExtensions
{
    public static string UsuarioId(this ControllerBase controller) =>
        controller.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("Usuário autenticado sem identificador.");
}
