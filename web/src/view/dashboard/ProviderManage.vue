<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const providers = ref([])
const showEditor = ref(false)
const form = reactive({
    name: '',
    baseUrl: '',
    apiKey: ''
})

const providerName = ref('')
const modelName = ref('')
const finalModelName = computed(() => {
    const provider = providerName.value
    const model = modelName.value
    return provider !== '' && model !== '' ? `${provider}/${model}` : ''
})

const apiUrl = computed(() => {
    const url = new URL(window.location.href)
    return `${url.protocol}//${url.host}/api/endpoint/v1`
})

const fetchProviders = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/provider/list')
        providers.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addProvider = () => {
    Object.assign(form, {
        name: '',
        baseUrl: '',
        apiKey: ''
    })

    showEditor.value = true
}

const editProvider = async idx => {
    const name = providers.value[idx].name

    try {
        loading.value = true
        const res = await axios.get(`/api/provider/info?name=${name}`)

        Object.assign(form, res.data)
        showEditor.value = true
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteProvider = async idx => {
    const name = providers.value[idx].name

    try {
        loading.value = true
        const res = await axios.delete(`/api/provider/delete?name=${name}`)

        ElMessage.success(res.data)
        await fetchProviders()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveProvider = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/provider/save', form)

        ElMessage.success(res.data)
        showEditor.value = false
        await fetchProviders()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchProviders)
</script>

<template>
    <el-button type="primary" :loading="loading" @click="fetchProviders">刷新</el-button>
    <el-button type="primary" :loading="loading" @click="addProvider">添加供应</el-button>
    <el-table v-loading="loading" :data="providers">
        <el-table-column prop="name" label="名称" width="160" />
        <el-table-column prop="baseUrl" label="基础地址" width="940" />
        <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
                <el-button type="primary" @click="editProvider(scope.$index)" link>编辑</el-button>
                <el-button type="danger" @click="deleteProvider(scope.$index)" link>删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <div class="row-gap" />
    <el-card>
        <template #header>
            <el-text size="large">使用方法</el-text>
        </template>
        <el-text type="info">API 地址 {{ apiUrl }}</el-text>
        <div class="row">
            <el-text>使用由</el-text>
            <el-select v-model="providerName" placeholder=" " style="width: 160px">
                <el-option v-for="provider in providers" :label="provider.name" :value="provider.name" />
            </el-select>
            <el-text>提供的</el-text>
            <el-input v-model="modelName" type="text" />
            <el-text>模型</el-text>
        </div>
        <el-text v-if="finalModelName !== ''" type="success">模型名称为 {{ finalModelName }}</el-text>
    </el-card>
    <el-dialog v-model="showEditor" title="供应编辑器" width="80%">
        <el-form :model="form" label-width="auto">
            <el-form-item label="名称">
                <el-input v-model="form.name" type="text" />
            </el-form-item>
            <el-form-item label="基础地址">
                <el-input v-model="form.baseUrl" type="text" />
            </el-form-item>
            <el-form-item label="API 密钥">
                <el-input v-model="form.apiKey" type="password" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :loading="loading" @click="saveProvider">保存</el-button>
            <el-button :loading="loading" @click="showEditor = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<style scoped>
.row-gap {
    height: 15px;
}

.row {
    margin: 5px 0;
    display: flex;
    align-items: center;
    column-gap: 5px;
}

.row .el-text {
    white-space: nowrap;
}
</style>
