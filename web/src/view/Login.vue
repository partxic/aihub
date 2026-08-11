<script setup>
document.title = '统一登录'

import { ref, reactive } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const form = reactive({
    username: '',
    password: ''
})

const doLogin = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/auth/login', form)

        ElMessage.success(res.data)
        router.push({ name: 'dashboard' })
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="container flex-center">
        <el-form :model="form" label-width="auto" style="max-width: 600px">
            <el-form-item label="用户">
                <el-input v-model="form.username" type="text" />
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="flex: 1" :loading="loading" @click="doLogin">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
}
</style>
