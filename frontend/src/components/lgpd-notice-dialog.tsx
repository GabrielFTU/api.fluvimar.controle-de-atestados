import { useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const LGPD_CONSENT_KEY = "fluvimar:lgpd-consent-v1"

function jaConcordou() {
  return localStorage.getItem(LGPD_CONSENT_KEY) === "true"
}

export function LgpdNoticeDialog() {
  const [aberto, setAberto] = useState(!jaConcordou())

  function concordar() {
    localStorage.setItem(LGPD_CONSENT_KEY, "true")
    setAberto(false)
  }

  return (
    <AlertDialog open={aberto}>
      <AlertDialogContent size="default" className="max-w-lg sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Aviso sobre tratamento de dados (LGPD)</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-left">
              <p>
                Este sistema trata dados pessoais sensíveis de saúde (atestados médicos e CIDs),
                nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
              <p>
                O acesso é individual, restrito a pessoas autorizadas e deve ser usado
                exclusivamente para fins de gestão de recursos humanos. Todo o uso é
                registrado e pode ser auditado.
              </p>
              <p>
                Ao continuar, você se compromete a manter sigilo sobre as informações
                acessadas e a não compartilhá-las fora dos processos de trabalho autorizados.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={concordar}>Li e concordo</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
