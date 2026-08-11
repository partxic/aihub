import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/view/Login.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/view/Dashboard.vue')
        }
    ]
})
