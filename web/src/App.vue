<script setup>
import { ref, watch } from 'vue'
import BackendValidator from '@/components/BackendValidator.vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const backendOk = ref(false)
const routerReady = ref(false)
const router = useRouter()
const route = useRoute()

watch(backendOk, async ok => {
    if (!ok) return

    await router.isReady()
    routerReady.value = true

    try {
        const res = await axios.get('/api/auth/status')

        ElMessage.success(res.data)
        if (!route.name || route.name === 'login') router.push({ name: 'dashboard' })
    } catch (error) {
        ElMessage.error(error.response.data)
        router.push({ name: 'login' })
    }
})
</script>

<template>
    <BackendValidator :status="backendOk" @ok="backendOk = true" />
    <router-view v-if="backendOk && routerReady" />
</template>

<style scoped></style>
