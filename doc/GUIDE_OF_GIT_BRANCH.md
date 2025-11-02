# 分支规划

## 发布分支 ```release/*```

分支以```release/```开头，该分支只能从主分支```merge```，__禁止直接提交__。发布的时候才执行```merge```操作，以保证发布分支代码稳定性。

发布分支

- 皇家娱乐 ```release/royal-entertainment```
- 皇家国际 ```release/royal-international```

## Tag规范

```{版本号}_{平台}_{日期}``` 如: ```2.0.1_R.E_20190618

## 主分支 ```main```

为保证分支稳定性，不允许提交未经过验证的代码。冲突原则：谁引入谁解决。

## 功能分支 ```feature/*```

当一个功能较为复杂，或需要验证，或与现有功能冲突时，需要从主分支```fork```一个feature分支。在功能分支开发过程中，要定期从主分支```merge```代码，功能完成后再```merge```回去。

分支命名：简明扼要，允许使用小写字母、数字、短横线。拼音不要缩写首字母，不要拼音英文一起用。

错误示例：

- ~~feature/zzh_wx~~ 应该改为 ```feature/zhajinhua-weixin```
- ~~feature/new-game-2~~ 命名应当简明扼要，避免猜测，猜错了要出事

## BUG分支 ```bug/*```

与功能分支类似

## 常用命令

```bash
#  查看所有分支
git branch -a

# 切换到main分支
git checkout main

# 从另一个分支合并代码到现分支
git merge feature/hot-swap

# 拉取代码
git pull origin hj-game/futrue-dev

# 推送代码 指定分支
git push origin hj-game/futrue-dev:hj-game/futrue-dev

# 从当前分支创建分支
git checkout -b feature/hot-swap

# 删除分支
git branch -d feature/hot-swap
```
