<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { computed, defineModel, ref } from 'vue'

const modelArray = defineModel({
    type: Array,
    required: true
})

const loading = ref(false)
const providers = ref([])
const models = ref([])

const providerName = ref('')
const modelName = ref('')
const finalModelName = computed(() => {
    const provider = providerName.value
    const model = modelName.value
    return provider !== '' && model !== '' ? `${provider}/${model}` : ''
})

const fetchProviders = async visible => {
    if (!visible) return

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

const fetchModels = async visible => {
    if (!visible) return

    try {
        loading.value = true
        const res = await axios.get(`/api/unimodel/model-list?provider=${providerName.value}`)
        models.value = res.data.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const addModel = () => {
    const model = finalModelName.value
    if (model !== '') {
        modelArray.value.push(model)

        providerName.value = ''
        modelName.value = ''
    }
}
</script>

<template>
    <div class="model-array-input" style="flex: 1">
        <div v-for="(_, index) in modelArray" class="array-item row">
            <el-input v-model="modelArray[index]" readonly />
            <el-button type="danger" :icon="Delete" @click="modelArray.splice(index, 1)" link />
        </div>
        <div class="row">
            <el-select v-model="providerName" placeholder=" " :loading="loading" style="width: 160px" @visible-change="fetchProviders">
                <el-option v-for="provider in providers" :label="provider.name" :value="provider.name" />
            </el-select>
            <el-text>/</el-text>
            <el-select v-model="modelName" placeholder=" " :loading="loading" style="flex: 1" @visible-change="fetchModels">
                <el-option v-for="model in models" :label="model.id" :value="model.id" />
            </el-select>
            <el-button type="primary" :icon="Plus" @click="addModel" link />
        </div>
    </div>
</template>

<style scoped>
.array-item {
    margin-bottom: 5px;
}

.row {
    display: flex;
    align-items: center;
    column-gap: 5px;
}

.row .el-text {
    white-space: nowrap;
}
</style>
