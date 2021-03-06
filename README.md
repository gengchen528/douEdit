# douEdit

> 可视化豆瓣批量操作工具

## 在线地址

http://douban.xkboke.com/

## 说明
- 首先需求很明确：快速删除掉在豆瓣小组内的发帖和回复记录
- 要访问自己的豆瓣小组，需要登录帐号获取会话信息，其中一个关键的信息会话ID<code>dbcl2</code>设置了<code>HttpOnly</code>，此外还需要一个动态id<code>ck</code>。当然这些问题都可以通过把所有的<code>Cookie</code>添加到客户端搞定。
- 要删除发帖记录，需要先删除掉贴子下的所有回复，在删除别人的回复时，需要调用管理员权限并提交理由
- 要删除掉回复记录，需要删除掉所有的自己的回复，但是别人的引用是无法删除的，所以最后要真正隐藏掉记录，需要注销帐号。
- 访问频率过高也会触发机器人，需要做访问限制

## 安装
    git clone git@github.com:gengchen528/douEdit.git
    cd douEdit
    npm install(或 cnpm install)
    node app.js

## 使用
打开浏览器
输入 http://localhost:3000/  (本地起了服务才能用这个链接访问)
根据界面操作提示即可

## 功能
- 获取发帖列表
- 获取回复列表
- 批量删除自己帖子的所有评论
- 删除自己的帖子
## 即将上线功能
- 批量取消喜欢的小组帖子
- 批量删除广播
- 批量取消收藏的小组帖子
## 后续功能
由于自己回复的帖子，删除评论涉及到查找评论所在的分页位置，所以目前正在开发中...如果你有更好的想法，欢迎交流
## 界面
![](http://image.bloggeng.com/dou.png)
## 贡献
如果你觉得不足的地方，欢迎来提交PR
