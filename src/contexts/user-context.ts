import { inject, provide, ref, watch, type InjectionKey, type Ref } from 'vue'
import { getAvatar } from '@/lib/tiptap-collab-utils'

export type User = {
  id: string
  name: string
  color: string
  avatar: string
}

export type UserContextValue = {
  user: Ref<User>
}

const UserContextKey: InjectionKey<UserContextValue> = Symbol('UserContext')

export const FIRST_NAMES = [
  'John',
  'Jane',
  'Alice',
  'Bob',
  'Eve',
  'Charlie',
  'David',
  'Frank',
  'Grace',
  'Helen',
]

export const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Jones',
  'Brown',
  'Davis',
  'Miller',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
]

export const USER_COLORS = [
  '#fb7185',
  '#fdba74',
  '#d9f99d',
  '#a7f3d0',
  '#a5f3fc',
  '#a5b4fc',
  '#f0abfc',
  '#fda58d',
  '#f2cc8f',
  '#9ae6b4',
]

const uuid = (): string => {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return template.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getRandomArrayItem = (array: string[]) => {
  if (array.length === 0) {
    throw new Error('Cannot get random item from empty array')
  }
  return array[Math.floor(Math.random() * array.length)]!
}

const generateRandomUsername = (): string => {
  const names = [getRandomArrayItem(FIRST_NAMES)]

  if (Math.random() > 0.85) {
    names.push(getRandomArrayItem(FIRST_NAMES))
  }
  names.push(getRandomArrayItem(LAST_NAMES))

  return names.join(' ')
}

const generateRandomColor = (): string => {
  return getRandomArrayItem(USER_COLORS) ?? '#9ae6b4'
}

const getFromLocalStorage = (
  key: string,
  fallback: () => string,
  isServer: boolean = typeof window === 'undefined'
): string => {
  if (isServer) {
    return fallback()
  }
  const value = window.localStorage.getItem(key)
  return value !== null ? value : fallback()
}

const getUsernameFromLocalStorage = (): string => {
  return getFromLocalStorage('_tiptap_username', generateRandomUsername)
}

const getColorFromLocalStorage = (): string => {
  return getFromLocalStorage('_tiptap_color', generateRandomColor)
}

const getUserIdFromLocalStorage = (): string => {
  return getFromLocalStorage('_tiptap_user_id', () => uuid())
}

export function provideUserContext() {
  const user = ref<User>({
    color: getColorFromLocalStorage(),
    name: getUsernameFromLocalStorage(),
    id: getUserIdFromLocalStorage(),
    avatar: getAvatar(getUsernameFromLocalStorage()),
  })

  // Watch for changes and save to localStorage
  watch(
    user,
    (newUser) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('_tiptap_username', newUser.name)
        window.localStorage.setItem('_tiptap_color', newUser.color)
        window.localStorage.setItem('_tiptap_user_id', newUser.id)
      }
    },
    { deep: true }
  )

  const contextValue: UserContextValue = {
    user,
  }

  provide(UserContextKey, contextValue)

  return contextValue
}

export const useUser = (): UserContextValue => {
  const context = inject(UserContextKey)
  if (!context) {
    throw new Error('useUser must be used within a component with UserContext provided')
  }
  return context
}
