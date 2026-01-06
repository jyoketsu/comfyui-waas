#!/bin/bash

# 本地目录
SRC_DIR="/home/workspace/yizhi/comfyui-waas"

# 目标服务器信息
REMOTE_PATH="~/comfyui/ComfyUI/custom_nodes"

# REMOTE_USER="root"
# REMOTE_HOST="ce1c098b37c147c3a5c80f35eb430f81.k8s171.inner"
# REMOTE_PORT="30149"
# PASSWORD="a8948667805f4a46ad08a84b1bcf44b7"

# REMOTE_USER="root"
# REMOTE_HOST="d83cb6bf8c5f464c9635647e62f65c4b.k8s171.inner"
# REMOTE_PORT="30128"
# PASSWORD="b39b988f3561446c9d8115d7310ea1f8"

REMOTE_USER="root"
REMOTE_HOST="2aada5fffb7b4bf8a0569d6a50409416.region2.waas.aigate.cc"
REMOTE_PORT="45690"
PASSWORD="d5b4558bb831408b9f68db044b5a1adb"

echo "开始部署..."

# 创建临时目录用于打包
TEMP_DIR="/tmp/comfyui-waas-deploy"
mkdir -p ${TEMP_DIR}/comfyui-waas

# 复制文件到临时目录的comfyui-waas子目录，排除vue和svelte目录
rsync -av --exclude='vue/' --exclude='svelte/' --exclude='.git/' --exclude='node_modules/' --exclude='.gitignore' ${SRC_DIR}/ ${TEMP_DIR}/comfyui-waas/

# 打包压缩
cd ${TEMP_DIR}
tar -czf comfyui-waas.tar.gz comfyui-waas

# 创建目标目录（避免scp失败）
ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"

# 传输压缩包到目标服务器
scp -P ${REMOTE_PORT} comfyui-waas.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 在目标服务器解压并清理
ssh -p ${REMOTE_PORT} ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_PATH} && tar -xzf comfyui-waas.tar.gz && rm comfyui-waas.tar.gz"

# 清理临时文件
rm -rf ${TEMP_DIR}

echo "部署完成！"