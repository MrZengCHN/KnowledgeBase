在 **Debian 12** 上安装 Docker 可以按照官方推荐步骤操作。这里我给你整理一份完整、可靠的流程：

------

## 1. 卸载旧版本（可选）

如果系统中已经安装过 Docker 旧版本（`docker` 或 `docker-engine`），先卸载：

```bash
sudo apt remove docker docker-engine docker.io containerd runc -y
```

------

## 2. 更新系统包索引

```bash
sudo apt update
sudo apt upgrade -y
```

------

## 3. 安装必要的依赖

Docker 官方需要一些包来支持 HTTPS 仓库：

```bash
sudo apt install ca-certificates curl gnupg lsb-release -y
```

------

## 4. 添加 Docker 官方 GPG 密钥

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

------

## 5. 添加 Docker 官方 APT 源

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

------

## 6. 更新包索引

```bash
sudo apt update
```

------

## 7. 安装 Docker 引擎

```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

------

## 8. 启动并检查 Docker

启动 Docker 并设置开机自启：

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

测试 Docker 是否安装成功：

```bash
sudo docker run hello-world
```

看到类似输出说明安装成功：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

------

## 9. 可选：允许非 root 用户使用 Docker

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

------

⚠️ 注意：

- Debian 12 默认使用 `bullseye` 的源，但 Docker 官方源会自动匹配 `bookworm`（Debian 12 的代号）。
- 如果要使用 **Docker Compose** 命令，请确认安装了 `docker-compose-plugin`。

------

如果你需要，我可以帮你写一个 **一条命令安装完整 Docker+Docker Compose** 的脚本，省掉一条条敲命令的麻烦。

你想让我直接给这个脚本吗？