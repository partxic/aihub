<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const caches = ref([])

const fetchCaches = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/cache/list')
        caches.value = res.data
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteCache = async idx => {
    const key = caches.value[idx].key

    try {
        loading.value = true
        const res = await axios.delete(`/api/cache/delete?key=${key}`)

        ElMessage.success(res.data)
        await fetchCaches()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

const deleteAllCache = async () => {
    try {
        loading.value = true
        const res = await axios.delete(`/api/cache/delete`)

        ElMessage.success(res.data)
        await fetchCaches()
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(fetchCaches)
</script>

<template>
    <el-button type="primary" :loading="loading" @click="fetchCaches">刷新</el-button>
    <el-button type="danger" :loading="loading" @click="deleteAllCache">删除全部</el-button>
    <el-table v-loading="loading" :data="caches">
        <el-table-column prop="key" label="键" width="1000" />
        <el-table-column fixed="right" label="操作" min-width="100">
            <template #default="scope">
                <el-button type="danger" @click="deleteCache(scope.$index)" link>删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<style scoped></style>
