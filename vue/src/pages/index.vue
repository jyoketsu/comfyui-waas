<script setup lang="ts">
import Iconfont from '@/components/common/Iconfont.vue';
import { ElLoading, ElMessage } from 'element-plus';
import { sync, getInEffectiveModels, clear, getModels } from '@/api/models';
import { ref, watch } from 'vue';

const ineffectiveDialogVisible = ref(false);
const loading = ref(false)
const selectedMedia = ref<any[]>([])
const paths = ref<string[]>([]);
const models = ref<any[]>([]);
const ineffectiveModels = ref<{
	path: string;
	name: string;
	targetPath: string;
}[]>([])
const name = ref('');

const handleSync = async () => {
	if (!selectedMedia.value.length) {
		ElMessage.warning('请选择要同步的模型')
		return
	}
	const loading = ElLoading.service({
		lock: true,
		text: '正在同步模型，此同步不会覆盖私有模型，请耐心等待',
		background: 'rgba(0, 0, 0, 0.5)',
	})
	try {
		await sync('/datasets/ComfyUI/models', selectedMedia.value, '/home/waas/ComfyUI/models')
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
		const data: any = {
			"/home/waas/ComfyUI/models/": {
				"details": [
					{
						"name": "controlnet",
						"target_path": "/shared/models/controlnet-v1.1",
					},
					{
						"name": "checkpoint.ckpt",
						"target_path": "/mnt/storage/checkpoints/model_v1.ckpt",
					}
				]
			},
			"/root/comfyui/Comfyui/models/": {
				"details": [
					{
						"name": "vae",
						"target_path": "/mnt/storage/vae_models/sdxl-vae",
					}
				]
			}
		};

		const keys = Object.keys(data);
		for (let index = 0; index < keys.length; index++) {
			const key = keys[index];
			data[key].details.forEach((item: any) => {
				ineffectiveModels.value.push({
					path: key,
					name: item.name,
					targetPath: item.target_path,
				})
			})
		}
		ineffectiveDialogVisible.value = true

		const res: any = await getInEffectiveModels(['/home/waas/ComfyUI/models/', '/root/comfyui/Comfyui/models/'])
		if (res.data) {
			ineffectiveDialogVisible.value = true
		} else {
			ElMessage.success('模型检测成功')
		}
	} catch (error) {
	} finally {
		loading.close();
	}
}

const handleClear = async () => {
	loading.value = true
	try {
		ineffectiveDialogVisible.value = true
		const paths = ineffectiveModels.value.map(item => item.path + item.name)
		await clear(paths)
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
	models.value.forEach(item => {
		toggleMediaSelection(item.filePath)
	})
}

const deselectAllInFolder = () => {
	selectedMedia.value = []
}

const handleGetModels = async (path: string, name?: string) => {
	const loading = ElLoading.service({
		lock: true,
		text: '查询中...',
		background: 'rgba(0, 0, 0, 0.5)',
	})
	try {
		const res: any = await getModels(path, name)
		selectedMedia.value = []
		if (res.code === 0) {
			models.value = res.data
		}
	} catch (error) {
	} finally {
		loading.close()
	}
}

const handleClickFolder = (item: any) => {
	if (item.isDir) {
		paths.value = [...paths.value, item.fileName]
		name.value = ''
	}
}

const handleClickNav = (index: number) => {
	paths.value = paths.value.slice(0, index + 1)
	name.value = ''
}

watch(paths, (newVal) => {
	handleGetModels(newVal.length ? newVal.join('/') : '/')
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
				<el-input v-model="name" placeholder="请输入模型名称" />
				<el-button type="primary" @click="handleGetModels(paths.length ? paths.join('/') : '/', name)">
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
				<span class="cursor-pointer" @click="paths = []; name = '';">{{ `models/diffusion_models/` }}</span>
				<span v-for="(item, index) in paths" :key="index" class="cursor-pointer" @click="handleClickNav(index)">{{
					`${item}/` }}</span>
			</div>
			<el-scrollbar v-if="models.length" class="flex-1">
				<div class="flex flex-wrap py-2 gap-4">
					<div v-for="(item, index) in models" :key="index"
						class="relative size-[144px] rounded-[10px] border border-[var(--el-border-color)] flex flex-col justify-center items-center overflow-hidden gap-2 cursor-pointer"
						@click="handleClickFolder(item)">
						<el-checkbox class="absolute top-2 left-2" :model-value="selectedMedia.includes(item.filePath)"
							@click.stop="toggleMediaSelection(item.filePath)" />
						<div class="size-10 bg-contain bg-center bg-no-repeat"
							:class="{ 'bg-[url(/icons/folder.png)]': item.isDir, 'bg-[url(/icons/file.png)]': !item.isDir }" />
						<el-tooltip :content="item.fileName" placement="bottom">
							<p class="w-full truncate px-1 text-center">{{ item.fileName }}</p>
						</el-tooltip>
						<p class="w-full text-[12px] truncate px-1 text-center text-[var(--el-color-info)]">{{ item.createTime }}
						</p>
					</div>
				</div>
			</el-scrollbar>
			<div v-else class="flex-1 w-full flex justify-center items-center text-[var(--el-color-info)]">暂无内容</div>
		</div>
	</div>
	<el-dialog v-model="ineffectiveDialogVisible" title="以下模型地址已失效" width="500">
		<div class="flex flex-col gap-1 max-h-[300px] overflow-hidden">
			<p class="text-[var(--el-color-info)]">经常清理失效模型，有助于节省存储用量</p>
			<p>{{ `数据盘：${`/datasets/ComfyUI/models`}` }}</p>
			<div class="space-y-1 flex-1 overflow-auto my-3">
				<div v-for="(item, index) in ineffectiveModels" :key="index"
					class="w-full overflow-hidden flex items-center justify-between">
					<span class="truncate">{{ item.targetPath }}</span>
					<span class="text-[var(--el-color-info)] text-[12px]">{{ `` }}</span>
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