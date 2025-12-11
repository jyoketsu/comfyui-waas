<script setup lang="ts">
import Iconfont from '@/components/common/Iconfont.vue';
import { ElLoading, ElMessage } from 'element-plus';
import { sync, getInEffectiveModels, clear, getModels, searchModels } from '@/api/models';
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

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
const isSelectAll = ref(false)

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
		// todo生产
		// 测试
		await sync(`/dataset/ComfyUI/models`, selectedMedia.value, '/home/waas/ComfyUI/models')
		// 生产
		// await sync(`/datasets/ComfyUI/models`, selectedMedia.value, '/home/waas/ComfyUI/models')
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
		ineffectiveModels.value = [];
		const res: any = await getInEffectiveModels(['/home/waas/ComfyUI/models/', '/root/comfyui/Comfyui/models/'])
		const data = res.data;
		const keys = Object.keys(data);
		if (keys.length) {
			ineffectiveDialogVisible.value = true

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
	if (selectedMedia.value.length === models.value.length) {
		isSelectAll.value = true
	} else {
		isSelectAll.value = false
	}
}

const selectAllInFolder = () => {
	models.value.forEach(item => {
		// toggleMediaSelection(item.filePath)
		selectedMedia.value.push(item.filePath)
	})
	isSelectAll.value = true;
}

const deselectAllInFolder = () => {
	selectedMedia.value = [];
	isSelectAll.value = false;
}

const handleGetModels = async (path: string, name?: string) => {
	const loading = ElLoading.service({
		lock: true,
		text: '查询中...',
		background: 'rgba(0, 0, 0, 0.5)',
	})
	try {
		const res: any = name ? await searchModels(name) : await getModels(path)
		selectedMedia.value = []
		isSelectAll.value = false
		if (res.code === 0) {
			models.value = res.data
		}
	} catch (error) {
	} finally {
		loading.close()
	}
}

const handleNameChange = useDebounceFn((val: string) => {
	handleGetModels(paths.value.length ? paths.value.join('/') : '/', val)
}, 800,)

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
	<div class="size-full bg-[var(--el-bg-color-overlay)] py-5 flex flex-col overflow-hidden gap-4">
		<div class="px-10">
			<p>
				网罗大量ComfyUI常用模型，秒级同步，为您节省 <span class="text-[var(--el-color-primary)] font-bold">{{ `${3.9}TB` }}</span> 存储空间
			</p>
			<p class="text-[var(--el-color-info)]">初次使用ComfyUI镜像建议同步所有模型</p>
		</div>
		<div class="px-10 flex justify-between items-center">
			<div class="flex items-center space-x-2">
				<el-input class="w-[300px]" v-model="name" placeholder="请输入模型名称" @input="handleNameChange">
					<template #prefix>
						<Iconfont icon="sousuo-copy" />
					</template>
				</el-input>
			</div>
			<div class="flex items-center space-x-2">
				<el-button type="primary" class="bg-[#1155AA] border-[#1155AA] hover:bg-[#1155AA]/80 hover:border-[#1155AA]/80"
					@click="handleSync">
					<Iconfont icon="refresh" class="mr-1" />
					同步
				</el-button>
				<el-tooltip content="云扉公模库会清理老旧模型，请定时检测，以防给您带来不必要的麻烦" placement="top">
					<el-button type="primary"
						class="bg-[#993333] border-[#993333] hover:bg-[#993333]/80 hover:border-[#993333]/80" @click="handleTest">
						<Iconfont icon="xiangxixinxi" class="mr-1" />
						失效模型检测
					</el-button>
				</el-tooltip>
			</div>
		</div>
		<div class="flex-1 flex flex-col overflow-hidden">
			<div class="h-[30px] flex items-center px-10 mb-3">
				<el-checkbox class="!mr-2" v-model="isSelectAll" @click.stop=""
					@change="(val: any) => val ? selectAllInFolder() : deselectAllInFolder()" />
				<span class="cursor-pointer" @click="paths = []; name = '';">{{ name?'搜索结果：':'models/' }}</span>
				<span v-if="!name" v-for="(item, index) in paths" :key="index" class="cursor-pointer"
					@click="handleClickNav(index)">{{
						`${item}/` }}</span>
			</div>
			<el-scrollbar v-if="models.length" class="flex-1 px-10">
				<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10  gap-4">
					<div v-for="(item, index) in models" :key="index"
						class="relative w-full aspect-square rounded-[10px] border border-[var(--el-border-color)] flex flex-col justify-center items-center overflow-hidden gap-2 cursor-pointer"
						@click="handleClickFolder(item)">
						<el-checkbox class="absolute top-2 left-2" :model-value="selectedMedia.includes(item.filePath)"
							@click.stop="toggleMediaSelection(item.filePath)" />
						<div class="size-[36%] bg-contain bg-center bg-no-repeat"
							:class="{ 'bg-[url(/icons/folder.png)]': item.isDir, 'bg-[url(/icons/file.png)]': !item.isDir }" />
						<el-tooltip :content="item.fileName" placement="bottom" :show-after="1000">
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