<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const route = useRoute()
const router = useRouter()

const tabs = computed(() => {
    const allRoutes = router.getRoutes()
    const dashboardRoute = allRoutes.find(route => route.name === 'dashboard')
    return dashboardRoute ? dashboardRoute.children || [] : []
})

const handleClick = (tab, _) => {
    const name = tab.paneName
    if (name !== 'logout') router.push({ name })
    else doLogout()
}

const doLogout = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/auth/logout')

        ElMessage.success(res.data)
        router.push({ name: 'login' })
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const redirect = () => {
    if (!route.name || route.name === 'dashboard') router.push({ name: 'account-manage' })
    else router.push({ name: route.name })
}

watch(
    () => route.name,
    _ => redirect(),
    { immediate: true }
)
</script>

<template>
    <div v-loading="loading" class="dashboard-container">
        <el-tabs :model-value="route.name" @tab-click="handleClick">
            <el-tab-pane v-for="tab in tabs" :label="tab.meta.tab" :name="tab.name" />
            <el-tab-pane label="退出登录" name="logout" />
        </el-tabs>
        <router-view />
    </div>
</template>

<style scoped>
.dashboard-container {
    width: 100vw;
    padding: 10px;
    box-sizing: border-box;
}
</style>
