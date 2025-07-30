import * as React from "react"

// Tipagens para elementos de toast
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Limite máximo de toasts exibidos ao mesmo tempo
const TOAST_LIMIT = 1

// Tempo (em ms) antes de remover o toast da memória após ser fechado
const TOAST_REMOVE_DELAY = 1000000

// Tipo base de toast com campos opcionais e um ID obrigatório
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Enum de tipos de ação para o reducer
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

// Contador para geração de IDs únicos
let count = 0

// Gera um ID numérico único como string
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Tipagem dos tipos de ação permitidos
type ActionType = typeof actionTypes

// Tipagem das ações do reducer
type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

// Estado com lista de toasts
interface State {
  toasts: ToasterToast[]
}

// Mapa para armazenar os timeouts de remoção de cada toast
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Adiciona o toast à fila de remoção após o tempo definido
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Função reducer que lida com todas as ações de estado
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Adiciona o novo toast e mantém no máximo TOAST_LIMIT
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Atualiza um toast existente baseado no ID
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Coloca o toast na fila de remoção com delay
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        // Se nenhum ID for passado, todos são programados para remoção
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // Marca os toasts como fechados visualmente
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    }

    case "REMOVE_TOAST":
      // Remove completamente o toast da lista
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Lista de ouvintes que serão notificados em cada mudança de estado
const listeners: Array<(state: State) => void> = []

// Estado mantido em memória (fora do React)
let memoryState: State = { toasts: [] }

// Função que despacha ações para o reducer e notifica os ouvintes
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Tipagem do toast externo (sem ID)
type Toast = Omit<ToasterToast, "id">

// Função principal para criar um toast
function toast({ ...props }: Toast) {
  const id = genId()

  // Função para atualizar o toast (ex: conteúdo ou status)
  const update = (props: ToasterToast) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })

  // Função para fechar o toast visualmente
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Adiciona o novo toast ao estado
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

// Hook para uso do sistema de toast dentro dos componentes React
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Adiciona o ouvinte na montagem
    listeners.push(setState)
    return () => {
      // Remove o ouvinte na desmontagem
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    ...state,
    toast, // função para criar um toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Exporta hook e função para uso global
export { useToast, toast }
