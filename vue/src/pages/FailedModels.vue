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
  <el-dialog v-model="dialogVisible" title="以下模型同步失败" width="500" @close="emit('update:visible', false)">
    <div class="flex flex-col gap-1 h-[300px] overflow-hidden">
      <!-- <p class="text-[var(--el-color-info)]">同步失败的模型可能是由于网络问题或模型文件损坏导致的</p> -->
      <el-scrollbar class="flex-1 mt-3">
        <div v-for="(item, index) in models" :key="index" class="truncate text-md py-1">
          {{ item }}
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