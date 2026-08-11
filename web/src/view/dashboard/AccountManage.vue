<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const loading = ref(false)
const router = useRouter()
const apiKey = ref('')
const form = reactive({
    password: ''
})

const resetPassword = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/account/reset-password', form)

        ElMessage.success(res.data)
        router.push({ name: 'login' })
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const fetchAPIKey = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/account/api-key')
        apiKey.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchAPIKey)
</script>

<template>
    <el-card>
        <template #header>
            <el-text size="large">重置密码</el-text>
        </template>
        <el-form :model="form" label-width="auto">
            <el-form-item>
                <el-text type="warning">重置密码后，现有 API Key 将失效</el-text>
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="loading" @click="resetPassword">重置</el-button>
            </el-form-item>
        </el-form>
    </el-card>
    <div class="row-gap" />
    <el-card>
        <template #header>
            <el-text size="large">API Key</el-text>
        </template>
        <div class="row">
            <el-input v-model="apiKey" readonly />
            <el-button type="primary" :loading="loading" @click="fetchAPIKey">获取</el-button>
        </div>
    </el-card>
</template>

<style scoped>
.row-gap {
    height: 15px;
}

.row {
    display: flex;
    align-items: center;
    column-gap: 5px;
}
</style>
