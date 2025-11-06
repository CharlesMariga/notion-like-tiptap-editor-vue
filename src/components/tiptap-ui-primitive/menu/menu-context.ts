import { inject, unref, type InjectionKey, type Ref, type ComputedRef } from 'vue'
import type { MenuContextValue } from './menu-types'

export const SEARCHABLE_CONTEXT_KEY = Symbol('searchable') as InjectionKey<Ref<boolean> | ComputedRef<boolean>>
export const MENU_CONTEXT_KEY = Symbol('menu') as InjectionKey<ComputedRef<MenuContextValue>>

export function useSearchableContext(): boolean {
  const context = inject(SEARCHABLE_CONTEXT_KEY)
  return context ? unref(context) : false
}

export function useMenuContext(): ComputedRef<MenuContextValue> {
  const context = inject(MENU_CONTEXT_KEY)
  if (!context) {
    throw new Error('useMenuContext must be used within a Menu component')
  }
  return context
}
