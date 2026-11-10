// src/router/authGuard.ts
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

function isAuthenticated(): boolean {
  return !!localStorage.getItem('token') // or use Pinia store
}

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' })
  } else {
    next()
  }
}
