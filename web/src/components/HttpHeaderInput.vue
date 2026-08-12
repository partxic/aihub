<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import { defineModel, ref } from 'vue'

const httpHeader = defineModel({
    type: Object,
    required: true
})

const headerName = ref('')
const headerValue = ref('')
const commonHeaders = [{ value: 'User-Agent' }, { value: 'Authorization' }, { value: 'Content-Type' }, { value: 'Accept' }, { value: 'Accept-Encoding' }, { value: 'Accept-Language' }, { value: 'Cache-Control' }, { value: 'Connection' }, { value: 'Cookie' }, { value: 'Host' }, { value: 'Origin' }, { value: 'Referer' }, { value: 'X-Forwarded-For' }, { value: 'X-Requested-With' }]

const addModel = () => {
    const name = headerName.value
    const value = headerValue.value
    if (name !== '' && value !== '') {
        httpHeader.value[name] = value

        headerName.value = ''
        headerValue.value = ''
    }
}

const querySearch = (q, cb) => {
    const query = q.toLowerCase()
    cb(q ? commonHeaders.filter(i => i.value.toLowerCase().includes(query)) : commonHeaders)
}
</script>

<template>
    <div class="http-header-input" style="flex: 1">
        <div v-for="(value, name) in httpHeader" class="header-item row">
            <el-input :model-value="name" readonly />
            <el-text>:</el-text>
            <el-input :model-value="value" readonly />
            <el-button type="danger" :icon="Delete" @click="delete httpHeader[name]" link />
        </div>
        <div class="row">
            <el-autocomplete v-model="headerName" :fetch-suggestions="querySearch" clearable />
            <el-text>:</el-text>
            <el-input v-model="headerValue" type="text" />
            <el-button type="primary" :icon="Plus" @click="addModel" link />
        </div>
    </div>
</template>

<style scoped>
.header-item {
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
