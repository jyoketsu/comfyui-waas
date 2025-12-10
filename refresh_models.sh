#!/bin/bash


folderRoot="/root/comfyui/ComfyUI/models/"
folderWaas="/home/waas/ComfyUI/models/"
folderTeam="/home/teams/"


echo "准备同步个人模型文件从，$folderWaas 到 $folderRoot ..."

syncmodels() {
    # 初始化计数器（保持你的写法）
    count=0

    # 统一尾斜杠，保证 `${sourceFolder}*` 只匹配子项
    local sourceFolder="${1%/}/"
    local targetFolder="${2%/}/"

    # 遍历文件夹A中的所有文件
    for file in "${sourceFolder}"*; do
        # 获取文件名
        filename="$(basename "$file")"

        # --- 关键修复：先判断软链，再判断目录 ---
        if [ -L "$file" ]; then
            # 源是软链：按软链处理，避免把“指向目录的软链”当目录递归
            if [ -e "${targetFolder}${filename}" ]; then
                echo "文件或链接已存在，跳过: ${filename}"
                continue
            fi
            # 如需绝对路径，可改用：ln -s "$(readlink -f "$file")" "${targetFolder}${filename}"
            ln -s "$(readlink "$file")" "${targetFolder}${filename}"
            count=$((count + 1))
            echo " $file 是软链"

        elif [ -d "$file" ]; then
            # 目录：确保目标目录存在，然后递归
            if [ ! -d "${targetFolder}${filename}" ]; then
                mkdir -p "${targetFolder}${filename}"
            fi
            echo "准备同步 $file 子文件夹 to ${targetFolder}${filename}/"
            syncmodels "$file" "${targetFolder}${filename}/"

        else
            # 常规文件：若目标已有同名则跳过，否则创建软链
            if [ -e "${targetFolder}${filename}" ]; then
                echo "文件或链接已存在，跳过: ${filename}"
                continue
            fi
            ln -s "$file" "${targetFolder}${filename}"
            count=$((count + 1))
            echo " $file 常规文件"
        fi

        # 打印已同步的文件数量（保持你的输出）
        echo "已同步 $count 个文件"
    done
}

# 确保文件夹B存在
mkdir -p "$folderRoot"
# 确保团队文件存在可为空
mkdir -p "$folderTeam"

echo "准备同步个人模型，从 $folderWaas 到 $folderRoot ..."
syncmodels "$folderWaas" "$folderRoot"

# 如果存在团队目录
if [ -d "$folderTeam" ]; then
    for teamDir in "$folderTeam"*/; do
        # 检查是否为目录
        if [ -d "$teamDir" ]; then
            # 如果存在/ComfyUI/models/子目录
            if [ -d "${teamDir}ComfyUI/models/" ]; then
                echo "同步团队模型目录: ${teamDir}ComfyUI/models/ 到 $folderRoot"
                syncmodels "${teamDir}ComfyUI/models/" "$folderRoot"
            fi
        fi
    done
fi

echo "同步完成！"