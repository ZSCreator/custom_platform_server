#!/bin/bash

echo "测试1: 检查密钥文件"
file .ssh/wc_cloud_google.pem

echo -e "\n测试2: 尝试使用绝对路径"
ssh -i "$HOME/Documents/密钥/wc_cloud_google.pem" -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@34.92.120.147 "echo 'Success'" 2>&1 | head -5

echo -e "\n测试3: 检查Google Cloud元数据API是否需要特定格式"
echo "提示: Google Cloud通常使用 gcloud compute ssh 命令"
echo "或者需要在Console中添加SSH密钥"

echo -e "\n建议:"
echo "1. 在Termius中，右键点击密钥 -> 导出"
echo "2. 将导出的密钥保存为 .ssh/wc_cloud_google.pem"
echo "3. 或者使用 gcloud compute scp 命令上传文件"
