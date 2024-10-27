# **cocos-png-packer**

cocos-png-packer用于将指定文件夹下的图片打包成适合cocos creator使用的图集

### 作用

* 适用于游戏开发者制作插件完善开发流程时使用。
* 打包图集时不限制最大宽高，换取更快的打包速度。
* 支持最新版本node（20+）。

### 使用

```
npm install cocos-png-packer
```

```
new Packer().packageByPath(inPath, outPath, name)
```
