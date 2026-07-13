using api.fluvimar.application.Servicos;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Repositories;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAtestadosRepositorio, AtestadoRepository>();
builder.Services.AddScoped<IFuncionarioRepositorio, FuncionarioRepository>();
builder.Services.AddScoped<ISetorRepositorio, SetorRepository>();

builder.Services.AddScoped<IAtestadoServico, AtestadoServico>();
builder.Services.AddScoped<IFuncionarioServico, FuncionarioServico>();
builder.Services.AddScoped<ISetorServico, SetorServico>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        context.Response.ContentType = "application/json";

        (context.Response.StatusCode, var message) = exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Ocorreu um erro interno.")
        };

        await context.Response.WriteAsJsonAsync(new { message });
    });
});

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
