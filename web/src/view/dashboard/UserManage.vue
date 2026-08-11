<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const showEditor = ref(false)
const users = ref([])
const form = reactive({
    name: '',
    password: '',
    isAdmin: false
})

const fetchUsers = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/user/list')
        users.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addUser = () => {
    Object.assign(form, {
        name: '',
        password: '',
        isAdmin: false
    })

    showEditor.value = true
}

const editUser = async idx => {
    const name = users.value[idx].name

    try {
        loading.value = true
        const res = await axios.get(`/api/user/info?name=${name}`)

        Object.assign(form, { password: '', ...res.data })
        showEditor.value = true
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteUser = async idx => {
    const name = users.value[idx].name

    try {
        loading.value = true
        const res = await axios.delete(`/api/user/delete?name=${name}`)

        ElMessage.success(res.data)
        await fetchUsers()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveUser = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/user/save', form)

        ElMessage.success(res.data)
        showEditor.value = false
        await fetchUsers()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchUsers)
</script>

<template>
    <el-button type="primary" :loading="loading" @click="fetchUsers">刷新</el-button>
    <el-button type="primary" :loading="loading" @click="addUser">添加用户</el-button>
    <el-table v-loading="loading" :data="users">
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="isAdmin" label="管理员" width="120">
            <template #default="scope">
                {{ users[scope.$index].isAdmin ? '是' : '否' }}
            </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
                <el-button type="primary" @click="editUser(scope.$index)" link>编辑</el-button>
                <el-button type="danger" @click="deleteUser(scope.$index)" link>删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog v-model="showEditor" title="账号编辑器" width="80%">
        <el-form :model="form" label-width="auto">
            <el-form-item label="名称">
                <el-input v-model="form.name" type="text" />
            </el-form-item>
            <el-form-item label="密码">
                <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="管理员">
                <el-checkbox v-model="form.isAdmin" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :loading="loading" @click="saveUser">保存</el-button>
            <el-button :loading="loading" @click="showEditor = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<style scoped></style>
