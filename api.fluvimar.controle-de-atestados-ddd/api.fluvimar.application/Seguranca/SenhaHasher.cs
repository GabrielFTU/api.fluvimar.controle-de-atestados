using System.Security.Cryptography;

namespace api.fluvimar.application.Seguranca;

public static class SenhaHasher
{
    private const int TamanhoSalt = 16;
    private const int TamanhoHash = 32;
    private const int Iteracoes = 210_000;
    private static readonly HashAlgorithmName Algoritmo = HashAlgorithmName.SHA256;

    public static string Hash(string senha)
    {
        var salt = RandomNumberGenerator.GetBytes(TamanhoSalt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, Iteracoes, Algoritmo, TamanhoHash);
        return $"{Iteracoes}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public static bool Verificar(string senha, string senhaHash)
    {
        var partes = senhaHash.Split('.', 3);
        if (partes.Length != 3 || !int.TryParse(partes[0], out var iteracoes))
            return false;

        var salt = Convert.FromBase64String(partes[1]);
        var hashEsperado = Convert.FromBase64String(partes[2]);
        var hashCalculado = Rfc2898DeriveBytes.Pbkdf2(senha, salt, iteracoes, Algoritmo, hashEsperado.Length);

        return CryptographicOperations.FixedTimeEquals(hashCalculado, hashEsperado);
    }
}
