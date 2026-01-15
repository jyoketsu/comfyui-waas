<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean,
  models: any[],
}>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void,
}>();

const dialogVisible = ref(false)

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <el-dialog v-model="dialogVisible" title="更新了以下模型" width="500" @close="emit('update:visible', false)">
    <div class="flex flex-col gap-1 h-[300px] overflow-hidden">
      <el-scrollbar class="flex-1">
        <div v-for="(item, index) in models" :key="index" class="truncate text-md">
          {{ item.fileName }}
        </div>
      </el-scrollbar>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          关闭
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>