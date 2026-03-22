import { writable } from 'svelte/store'

export const currentPath = writable<string>(window.location.pathname)

const protectedRoutes = ['/dashboard', '/setting', '/room']
// let isProtected = protectedRoutes.includes(window.location.pathname)
// let protectedPath = isProtected ? window.location.pathname : ''

// export function navigateTo(path: string): void
// {
//     if (protectedRoutes.includes(path))
//     {
//         isProtected = true
//         protectedPath = path
//         window.history.replaceState(null, '', path)

//         window.history.pushState(null, '', path)
//         window.history.back()
//         window.history.forward()
//     }
//     else
//     {
//         isProtected = false
//         protectedPath = ''
//     }
//     currentPath.set(path)
// }

// Block back/forward navigation
// window.addEventListener('popstate', () => {
//     if (isProtected)
//     {
//         history.go(1)
//         return
//     }

//     const path = window.location.pathname || '/'

//     // Block forward navigation to protected routes when logged out
//     if (protectedRoutes.includes(path))
//     {
//         window.history.replaceState(null, '', '/')
//         currentPath.set('/')
//         return
//     }

//     currentPath.set(path)
// })


// Helper to check if a path starts with any of our protected prefixes
const isPathProtected = (path: string) => 
    protectedRoutes.some(route => path.startsWith(route));

export function navigateTo(path: string): void {
    // 1. Update the browser URL (This was missing for non-protected or dynamic routes)
    window.history.pushState(null, '', path);

    // 2. Update the Svelte store so the UI switches components
    currentPath.set(path);
}

// Handle browser Back/Forward buttons
window.addEventListener('popstate', () => {
    const path = window.location.pathname;

    // Optional: Add logic here to redirect to login if user 
    // tries to 'Back' into a protected route while logged out
    currentPath.set(path);
});









