<script setup>
import HttpHeaderInput from '@/components/HttpHeaderInput.vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const mcps = ref([])
const showEditor = ref(false)
const form = reactive({
    name: '',
    url: '',
    httpHeader: {}
})

const apiUrl = computed(() => {
    const url = new URL(window.location.href)
    return `${url.protocol}//${url.host}/api/endpoint/mcp`
})

const fetchMcps = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/mcp/list')
        mcps.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addMcp = () => {
    Object.assign(form, {
        name: '',
        url: '',
        httpHeader: {}
    })

    showEditor.value = true
}

const editMcp = async idx => {
    const name = mcps.value[idx].name

    try {
        loading.value = true
        const res = await axios.get(`/api/mcp/info?name=${name}`)

        Object.assign(form, res.data)
        showEditor.value = true
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteMcp = async idx => {
    const name = mcps.value[idx].name

    try {
        loading.value = true
        const res = await axios.delete(`/api/mcp/delete?name=${name}`)

        ElMessage.success(res.data)
        await fetchMcps()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveMcp = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/mcp/save', form)

        ElMessage.success(res.data)
        showEditor.value = false
        await fetchMcps()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchMcps)
</script>

<template>
    <el-button type="primary" :loading="loading" @click="fetchMcps">刷新</el-button>
    <el-button type="primary" :loading="loading" @click="addMcp">添加 MCP</el-button>
    <el-table v-loading="loading" :data="mcps">
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="url" label="地址" width="940" />
        <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
                <el-button type="primary" @click="editMcp(scope.$index)" link>编辑</el-button>
                <el-button type="danger" @click="deleteMcp(scope.$index)" link>删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <div class="row-gap" />
    <el-card>
        <el-text type="info">API 地址 {{ apiUrl }}</el-text>
    </el-card>
    <el-dialog v-model="showEditor" title="MCP 编辑器" destroy-on-close width="80%">
        <el-form :model="form" label-width="auto">
            <el-form-item label="名称">
                <el-input v-model="form.name" type="text" />
            </el-form-item>
            <el-form-item label="地址">
                <el-input v-model="form.url" type="text" />
            </el-form-item>
            <el-form-item label="请求头列表">
                <HttpHeaderInput v-model="form.httpHeader" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :loading="loading" @click="saveMcp">保存</el-button>
            <el-button :loading="loading" @click="showEditor = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>
.row-gap {
    height: 15px;
}
</style>
