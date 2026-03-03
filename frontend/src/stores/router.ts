import { writable } from 'svelte/store'

export const currentPath = writable<string>(window.location.pathname)

const protectedRoutes = [ '/dashboard', '/setting']
let isProtected = false

export function navigateTo(path: string): void
{
    if(protectedRoutes.includes(path))
    {
        isProtected = true
        window.history.replaceState(null, '', path)
        // Push a dummy entry 
        window.history.pushState(null,'', path)
    }
    else
    {
        isProtected = false
        window.history.pushState(null, '', path)
    }
    currentPath.set(path)
}

window.addEventListener('popstate', () => {
    if (isProtected)
    {
        window.history.pushState(null, '', window.location.pathname)
        return
    }
    currentPath.set(window.location.pathname || '/')
})