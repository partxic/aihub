<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { defineProps, defineEmits, ref, computed, onMounted } from 'vue'

const props = defineProps({
    status: {
        type: Boolean,
        required: true
    }
})

const emits = defineEmits(['ok'])

const loading = ref(false)
const dialogVisible = computed(() => !props.status)

const validate = async () => {
    try {
        loading.value = true
        const res = await axios.get('/api/status')

        ElMessage.success(res.data)
        emits('ok')
    } catch (error) {
        ElMessage.error(error.response.data)
    } finally {
        loading.value = false
    }
}

onMounted(validate)
</script>

<template>
    <el-dialog :model-value="dialogVisible" align-center :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :header-class="'display-none'">
        <div class="flex-center">
            <el-button :loading="loading" @click="validate">验证后端配置</el-button>
        </div>
    </el-dialog>
</template>

<style scoped></style>
