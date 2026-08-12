<script setup>
import ModelArrayInput from '@/components/ModelArrayInput.vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const loading = ref(false)
const unimodels = ref([])
const showEditor = ref(false)
const form = reactive({
    name: '',
    models: []
})

const fetchUniModels = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/unimodel/list')
        unimodels.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addUniModel = () => {
    Object.assign(form, {
        name: '',
        models: []
    })

    showEditor.value = true
}

const editUniModel = async idx => {
    const name = unimodels.value[idx].name

    try {
        loading.value = true
        const res = await axios.get(`/api/unimodel/info?name=${name}`)

        Object.assign(form, res.data)
        showEditor.value = true
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteUniModel = async idx => {
    const name = unimodels.value[idx].name

    try {
        loading.value = true
        const res = await axios.delete(`/api/unimodel/delete?name=${name}`)

        ElMessage.success(res.data)
        await fetchUniModels()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const saveUniModel = async () => {
    try {
        loading.value = true
        const res = await axios.post('/api/unimodel/save', form)

        ElMessage.success(res.data)
        showEditor.value = false
        await fetchUniModels()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchUniModels)
</script>

<template>
    <el-button type="primary" :loading="loading" @click="fetchUniModels">刷新</el-button>
    <el-button type="primary" :loading="loading" @click="addUniModel">添加联合模型</el-button>
    <el-table v-loading="loading" :data="unimodels">
        <el-table-column prop="name" label="名称" width="1000" />
        <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
                <el-button type="primary" @click="editUniModel(scope.$index)" link>编辑</el-button>
                <el-button type="danger" @click="deleteUniModel(scope.$index)" link>删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-dialog v-model="showEditor" title="联合模型编辑器" destroy-on-close width="80%">
        <el-form :model="form" label-width="auto">
            <el-form-item label="名称">
                <el-input v-model="form.name" type="text" />
            </el-form-item>
            <el-form-item label="模型列表">
                <ModelArrayInput v-model="form.models" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button type="primary" :loading="loading" @click="saveUniModel">保存</el-button>
            <el-button :loading="loading" @click="showEditor = false">取消</el-button>
        </template>
    </el-dialog>
</template>

<style scoped></style>
