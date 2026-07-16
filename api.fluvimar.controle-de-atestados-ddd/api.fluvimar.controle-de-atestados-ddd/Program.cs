using System.Text;
using api.fluvimar.application.Seguranca;
using api.fluvimar.application.Servicos;
using api.fluvimar.domain.Classes;
using api.fluvimar.domain.Entities;
using api.fluvimar.domain.Interfaces.Repositorios;
using api.fluvimar.domain.Interfaces.Servicos;
using api.fluvimar.infrastructure.Data;
using api.fluvimar.infrastructure.Data.Seed;
using api.fluvimar.infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var corsAllowedOriginsCsv = builder.Configuration["Cors:AllowedOriginsCsv"];
var allowedOrigins = !string.IsNullOrWhiteSpace(corsAllowedOriginsCsv)
    ? corsAllowedOriginsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    : builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAtestadosRepositorio, AtestadoRepository>();
builder.Services.AddScoped<IFuncionarioRepositorio, FuncionarioRepository>();
builder.Services.AddScoped<ISetorRepositorio, SetorRepository>();
builder.Services.AddScoped<ICidRepositorio, CidRepository>();
builder.Services.AddScoped<IMedicoRepositorio, MedicoRepository>();
builder.Services.AddScoped<IUsuarioRepositorio, UsuarioRepository>();

builder.Services.AddScoped<IAtestadoServico, AtestadoServico>();
builder.Services.AddScoped<IFuncionarioServico, FuncionarioServico>();
builder.Services.AddScoped<ISetorServico, SetorServico>();
builder.Services.AddScoped<ICidServico, CidServico>();
builder.Services.AddScoped<IEstatisticaServico, EstatisticaServico>();
builder.Services.AddScoped<IMedicoServico, MedicoServico>();
builder.Services.AddScoped<IUsuarioServico, UsuarioServico>();
builder.Services.AddScoped<IAutenticacaoServico, AutenticacaoServico>();

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
    ?? throw new InvalidOperationException("Configuração 'Jwt' ausente.");
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecurityKey)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("isAdmin", "true"));
});

var app = builder.Build();

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
};
// O proxy reverso roda fora da rede do Docker Compose, então o IP de origem
// não é conhecido antecipadamente — confia-se no primeiro hop encaminhado.
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

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
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Ocorreu um erro interno.")
        };

        await context.Response.WriteAsJsonAsync(new { message });
    });
});

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await context.Database.MigrateAsync();
    await CidSeeder.SeedAsync(context);

    if (!await context.Usuarios.AnyAsync())
    {
        var adminEmail = builder.Configuration["Admin:Email"];
        var adminPassword = builder.Configuration["Admin:Password"];

        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
        {
            app.Logger.LogWarning(
                "Nenhum usuário cadastrado e as variáveis Admin__Email/Admin__Password não foram definidas. " +
                "Configure-as para que o usuário administrador inicial seja criado.");
        }
        else
        {
            var admin = new Usuario(userId: "seed");
            admin.SetNome("Administrador");
            admin.SetEmail(adminEmail);
            admin.SetSenhaHash(SenhaHasher.Hash(adminPassword));
            admin.SetIsAdmin(true);

            context.Usuarios.Add(admin);
            await context.SaveChangesAsync();
            app.Logger.LogInformation("Usuário administrador inicial criado para {Email}.", adminEmail);
        }
    }
}

app.Run();
