import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
})

type LoginFormValues = z.infer<typeof loginSchema>

const RECURSOS = ["RASTREABILIDADE", "APROVAÇÕES", "RELATÓRIOS"]

export function LoginPage() {
  const { usuario, login } = useAuth()
  const location = useLocation()
  const [enviando, setEnviando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [manterConectado, setManterConectado] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  })

  if (usuario) {
    const destino = (location.state as { from?: Location })?.from?.pathname ?? "/apontamentos"
    return <Navigate to={destino} replace />
  }

  async function entrar(valores: LoginFormValues) {
    setEnviando(true)
    try {
      await login(valores)
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 401
          ? "E-mail ou senha inválidos."
          : "Não foi possível entrar. Tente novamente."
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-center gap-8 overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-blue-900 px-16 py-20 md:flex">
        <div className="pointer-events-none absolute -right-40 top-1/2 size-128 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-1/2 size-80 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />

        <img
          src="/img/fluvimar-frase.png"
          alt="Fluvimar"
          className="relative h-8 w-fit shrink-0 self-start object-contain brightness-0 invert"
        />

        <div className="relative flex flex-col gap-4">
          <h1 className="text-5xl font-bold leading-tight text-white">
            Controle de
            <br />
            Atestados
          </h1>
          <p className="max-w-sm text-slate-300">
            Centralize o registro de atestados médicos e acompanhe o retorno dos colaboradores por setor.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-3">
          {RECURSOS.map((recurso) => (
            <span
              key={recurso}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-200"
            >
              {recurso}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-8 bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground">
              Informe suas credenciais para acessar o sistema
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(entrar)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="email"
                          autoComplete="username"
                          placeholder="voce@empresa.com"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock />
                        </InputGroupAddon>
                        <InputGroupInput
                          type={mostrarSenha ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Sua senha"
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            onClick={() => setMostrarSenha((valor) => !valor)}
                          >
                            {mostrarSenha ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={manterConectado}
                  onCheckedChange={(valor) => setManterConectado(valor === true)}
                />
                Manter conectado por 7 dias
              </label>

              <Button type="submit" disabled={enviando} className="mt-2 h-11">
                {enviando ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-xs text-muted-foreground">Fluvimar © 2026 By Valisys</p>
      </div>
    </div>
  )
}
