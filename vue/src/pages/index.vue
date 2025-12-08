<script setup lang="ts">
import Iconfont from '@/components/common/Iconfont.vue';
import { ElLoading, ElMessage } from 'element-plus';
import { sync, getInEffectiveModels, clear, getModels } from '@/api/models';
import { ref, watch } from 'vue';

const ineffectiveDialogVisible = ref(false);
const loading = ref(false)
const selectedMedia = ref<any[]>([])
const paths = ref(['test']);
const models = ref<any[]>([]);

const handleSync = async () => {
	const loading = ElLoading.service({
		lock: true,
		text: '正在同步模型，此同步不会覆盖私有模型，请耐心等待',
		background: 'rgba(0, 0, 0, 0.5)',
	})
	try {
		await sync('test')
		ElMessage.success('模型同步成功')
	} catch (error) {
	} finally {
		loading.close();
	}
}

const handleTest = async () => {
	const loading = ElLoading.service({
		lock: true,
		text: '正在检测数据盘中已失效的模型，请耐心等待',
		background: 'rgba(0, 0, 0, 0.5)',
	})
	try {
		ineffectiveDialogVisible.value = true
		await getInEffectiveModels('test')

		ElMessage.success('模型检测成功')
	} catch (error) {
	} finally {
		loading.close();
	}
}

const handleClear = async () => {
	loading.value = true
	try {
		ineffectiveDialogVisible.value = true
		await clear('test')
		ElMessage.success('模型清除成功')
	} catch (error) {
	} finally {
		loading.value = false
	}
}

const toggleMediaSelection = (id: any) => {
	const index = selectedMedia.value.indexOf(id)
	if (index > -1) {
		selectedMedia.value.splice(index, 1)
	} else {
		selectedMedia.value.push(id)
	}
}

const selectAllInFolder = () => {
	selectedMedia.value = Array.from({ length: 100 }, (_, i) => i)
}

const deselectAllInFolder = () => {
	selectedMedia.value = []
}

const handleGetModels = async (path: string) => {
	const res: any = await getModels(path)
	selectedMedia.value = []
	if (res.code === 0) {
		models.value = res.data
	}
}

const handleClickFolder = (item: any) => {
	if (item.isDir) {
		paths.value = [...paths.value, item.fileName]
	}
}

watch(paths, (newVal) => {
	handleGetModels(newVal.join('/'))
}, { immediate: true })
</script>

<template>
	<div class="size-full bg-[var(--el-bg-color-overlay)] py-5 px-10 flex flex-col overflow-hidden gap-4">
		<div>
			<p>
				网罗大量ComfyUI常用模型，秒级同步，为您节省 <span class="text-[var(--el-color-primary)] font-bold">{{ `${3.7}TB` }}</span> 存储空间
			</p>
			<p>初次使用ComfyUI镜像建议同步所有模型</p>
		</div>
		<div class="flex justify-between items-center">
			<div class="flex items-center space-x-2">
				<el-input placeholder="请输入模型名称" />
				<el-button type="primary">
					<Iconfont icon="sousuo-copy" class="mr-1" />
					搜索
				</el-button>
			</div>
			<div class="flex items-center space-x-2">
				<el-button type="primary" @click="handleSync">
					<Iconfont icon="refresh" class="mr-1" />
					同步
				</el-button>
				<el-button type="primary" @click="handleTest">
					<Iconfont icon="xiangxixinxi" class="mr-1" />
					失效模型检测
				</el-button>
			</div>
		</div>
		<div class="flex-1 flex flex-col overflow-hidden">
			<div class="h-[30px] flex items-center">
				<el-checkbox class="!mr-2" @click.stop=""
					@change="(val: any) => val ? selectAllInFolder() : deselectAllInFolder()" />
				<span>{{ `models/diffusion_models/${paths.join('/')}` }}</span>
			</div>
			<el-scrollbar class="flex-1">
				<div class="flex flex-wrap py-2 gap-4">
					<div v-for="item in 100" :key="item"
						class="relative size-[144px] rounded-[10px] border border-[var(--el-border-color)] flex flex-col justify-center items-center overflow-hidden gap-2 cursor-pointer"
						@click="handleClickFolder(item)">
						<el-checkbox class="absolute top-2 left-2" :model-value="selectedMedia.includes(item)"
							@click.stop="toggleMediaSelection(item)" />
						<div class="size-10 bg-contain bg-center bg-no-repeat" :class="{ 'bg-[url(/icons/folder.png)]': true }" />
						<p class="w-full truncate px-1 text-center">文件名文件名文件名文件名文件名文件名</p>
						<p class="w-full text-[12px] truncate px-1 text-center text-[var(--el-color-info)]">2025-09-26 14:01:14</p>
					</div>
				</div>
			</el-scrollbar>
		</div>
	</div>
	<el-dialog v-model="ineffectiveDialogVisible" title="以下模型地址已失效" width="500">
		<div class="flex flex-col gap-1 max-h-[300px] overflow-hidden">
			<p class="text-[var(--el-color-info)]">经常清理失效模型，有助于节省存储用量</p>
			<p>{{ `数据盘：${`/home/waas/ComfyUI/models`}` }}</p>
			<div class="space-y-1 flex-1 overflow-auto">
				<div v-for="item in 100" :key="item" class="w-full overflow-hidden flex items-center justify-between">
					<span class="truncate">{{ `${item}/unet/Wan2.1-480p.gguf` }}</span>
					<span class="text-[var(--el-color-info)] text-[12px]">{{ `2025-09-26 14:01:14` }}</span>
				</div>
			</div>
		</div>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="ineffectiveDialogVisible = false">取消</el-button>
				<el-button :loading="loading" type="primary" @click="handleClear">
					确认清除
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>