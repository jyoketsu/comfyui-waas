#!/bin/bash

# 本地目录
SRC_DIR="/home/workspace/yizhi/comfyui-waas"

# 目标服务器信息
REMOTE_PATH="~/comfyui/ComfyUI/custom_nodes"

# REMOTE_USER="root"
# REMOTE_HOST="2aada5fffb7b4bf8a0569d6a50409416.region2.waas.aigate.cc"
# REMOTE_PORT="45690"
# PASSWORD="d5b4558bb831408b9f68db044b5a1adb"

REMOTE_USER="root"
REMOTE_HOST="3cce776552314819b624048703df3784.k8s171.inner"
REMOTE_PORT="30118"
PASSWORD="5908c6aad12e48afa77f506d341c6070"

# REMOTE_USER="root"
# REMOTE_HOST="9cf848a86ee04c73ac04689793614498.k8s171.inner"
# REMOTE_PORT="30213"
# PASSWORD="f82c9faca10d4ab2abc4a2d39d297775"

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