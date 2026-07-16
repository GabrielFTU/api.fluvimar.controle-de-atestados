using System.Globalization;
using System.Text;

namespace api.fluvimar.domain.Classes
{
    public static class NormalizadorTexto
    {
        public static string Normalizar(string texto)
        {
            var decomposto = texto.Normalize(NormalizationForm.FormD);
            var semAcento = new StringBuilder();

            foreach (var c in decomposto)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    semAcento.Append(c);
            }

            return semAcento.ToString().Normalize(NormalizationForm.FormC).ToUpperInvariant();
        }
    }
}
