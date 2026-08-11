import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            meta: {
                title: '统一登录'
            },
            component: () => import('@/view/Login.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            meta: {
                title: '管理面板'
            },
            component: () => import('@/view/Dashboard.vue'),
            children: [
                {
                    path: 'account-manage',
                    name: 'account-manage',
                    meta: {
                        tab: '账号管理',
                        title: '账号管理'
                    },
                    component: () => import('@/view/dashboard/AccountManage.vue')
                },
                {
                    path: 'user-manage',
                    name: 'user-manage',
                    meta: {
                        tab: '用户管理',
                        title: '用户管理'
                    },
                    component: () => import('@/view/dashboard/UserManage.vue')
                },
                {
                    path: 'provider-manage',
                    name: 'provider-manage',
                    meta: {
                        tab: '供应管理',
                        title: '供应管理'
                    },
                    component: () => import('@/view/dashboard/ProviderManage.vue')
                },
                {
                    path: 'unimodel-manage',
                    name: 'unimodel-manage',
                    meta: {
                        tab: '联合模型管理',
                        title: '联合模型管理'
                    },
                    component: () => import('@/view/dashboard/UniModelManage.vue')
                },
                {
                    path: 'mcp-manage',
                    name: 'mcp-manage',
                    meta: {
                        tab: 'MCP管理',
                        title: 'MCP管理'
                    },
                    component: () => import('@/view/dashboard/McpManage.vue')
                }
            ]
        }
    ]
})

router.afterEach(to => {
    document.title = to.matched
        .map(r => r.meta.title)
        .reverse()
        .join(' | ')
})

export default router
