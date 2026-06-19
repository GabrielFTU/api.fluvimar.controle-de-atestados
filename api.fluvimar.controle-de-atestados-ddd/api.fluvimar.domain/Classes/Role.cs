using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace api.fluvimar.domain.Classes
{
    public sealed class Role
    {
        public static string Administrador => nameof(Administrador);
        public static string Padrao => nameof(Padrao);
    }
}
