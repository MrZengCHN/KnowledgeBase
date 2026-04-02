## 以下操作均在Debian12下进行



## 升级系统

apt update

apt upgrade -y

## 安装CPA

https://help.router-for.me/cn/introduction/quick-start

## 配置文件修改



```
remote-management:
  allow-remote: true
  secret-key: "yourpassword"
```

## 设置用户

给 root 开启 lingering

```
loginctl enable-linger root
```

然后再查看：

```
loginctl show-user root
```

确认变成：

```
Linger=yes
```



## 启动CPA

```
systemctl --user enable cliproxyapi.service
systemctl --user start cliproxyapi.service
systemctl --user status cliproxyapi.service
```





## 安装证书

```
# Ubuntu / Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -Y  # Nginx 示例
# 或者 python3-certbot-apache  # Apache 示例
```

申请证书并自动配置

```
# Nginx
sudo certbot --nginx -d yourdomain.com -d yourdomain.com
```

![image-20260402190210513](./assets/CPA%E5%AE%89%E8%A3%85%E7%AC%94%E8%AE%B0/image-20260402190210513.png)



设置自动续期

```
# 测试续期
sudo certbot renew --dry-run
```



http://yourdomain.com:8317/management.html#/config

设置好证书后

systemctl --user restart cliproxyapi.service



https://yourdomain.com:8317/management.html#/config