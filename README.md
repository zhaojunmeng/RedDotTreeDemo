# RedDotDemoCocos

关键词：红点树 红点系统demo 单元测试

## 写在最前

首先要说的是，关于红点系统/红点树的文章和代码，免费的付费的，都能搜到不少。
红点系统说白了就是一个树状结构，所以在方案实现思路上，本demo和其他方案，没有本质的区别。

那为什么要费这个劲儿来多写一个demo，其实还是因为和其他文章，有一些不同点：

* 搭了一个极简的GUI演示demo。可以直观的看到红点系统运行时的样子，也方便自己修改demo代码来更好的理解系统的运行。
* 基于上述的demo，部署了一个可体验的Web版本，这样读者可以免于下载引擎，就可以先看到demo运行时的样子。
* 用一套单元测试用例，保障了红点树的逻辑实现正确。（之前也看到过有人问，游戏开发中，写不写单元测试，怎么写。这个demo就算是一个在游戏开发中，运用单元测试保证逻辑正确性的一个例子吧）

本demo使用的引擎是CocosCreator，版本是3.4.2。

为什么选择CocosCreator呢？

其实上面要计划部署Web体验版，就注定Cocos比Unity和UE要方便了；另外CocosCreator的安装包也稍微小一些，下载起来也不慢（使用体验上还挺接近Unity的，所以也不算难上手）。

## 红点树设计思路

### 需求分析

红点的存在，就是告诉用户，层级更深的UI中，有需要你关注的东西。

整篇文章，我们都会以下面这个未读邮件的例子，来展开系统的讲解：

* 主界面上，有邮件界面入口按钮 MailButton。点击MailButton，就会打开邮件界面，邮件界面中，展示的是邮件列表。
* 如果有未读邮件，主界面的MailButton上，会显示红点，并且红点上会有一个数字x，告诉用户：“你有x封未读邮件”。这里的红点数字x，我们统称为“红点值”。
* 用户点击了带有红点的MailButton，邮件界面打开，用户会看到未读的邮件icon上面，也有红点。
* 点击未读邮件icon，邮件状态变为已读，邮件icon的红点消失，MailButton的红点值减1，当红点值等于0时，MailButton红点隐藏。

下图是我用PlantUML画的一个脑图，展示了逻辑上的红点关系。

![Alt text](/Docs/Pic/RedDot_MindMap.png "")

这副灵魂配图是demo中，关于MailButton红点和邮件列表红点的展示。
![Alt text](/Docs/Pic/RedDot_DemoUI.png "")

### Don't

一种简单粗暴的实现方式是（我在两个不同的项目中，都看到过这种实现）：

* 定义一个全局的事件，比如这个事件叫"RedDotChanged"
* 当数据变化，比如邮件的已读状态改变，就广播"RedDotChanged"事件。
* 然后每个UI结点，都响应该事件，重新计算红点状态，刷新UI表现。
* （更离谱的写法是，连数据修改发送事件都懒得写，直接在Update方法中，每帧都让UI去重新计算红点状态）

这么实现的问题是八杆子打不着的红点，会在这个全局的刷新事件中重新计算，造成了不必要的运算浪费。

### 红点树的逻辑抽象

* 红点是有父子关系的，子节点的红点值变化，会带来父节点的红点值变化。
  * 比如未读邮件Mail1，是MailButton的子节点，Mail1的红点值变化，会带来MailButton红点值的变化。
* 父节点的红点值，要么是子节点红点值求和，要么是子节点红点值的逻辑或（or）
  * 求和：父节点红点值 = 所有子节点红点值之和。
    * 比如 MailButton = Mail1 + Mail2 + ...
  * 逻辑或：父节点红点值 = 1 ： 如果任意子节点红点值大于0； 否则，红点值就是0。
    * 比如BulletsButton = Bullet1 or Bullet2 or ...
* 只能通过主动修改叶子节点的红点值
  * 这条是上一条推出来的，因为父节点的红点值都是由子节点的红点值计算得到的
  * 修改非叶子节点的红点值的行为，在需求上也没有
* 修改叶子节点的红点值之后，递归修改其父节点的红点值，直到根节点
  * 也就是说，只有从叶子节点到根节点，监听了这些节点的UI组件需要被更新。

### 红点树代码实现

讲完逻辑抽象，代码实现就直接贴链接了。
红点树的逻辑实现，就在下面的两个类中：

[RedDotTree.ts](RedDotDemoCocos/assets/scripts/thirdParty/redDotTree/RedDotTree.ts) : 红点树对外接口

[RedDotTreeNode.ts](RedDotDemoCocos/assets/scripts/thirdParty/redDotTree/RedDotTreeNode.ts.ts) : 红点树节点的逻辑实现

### 问：把红点树用起来，总共分几步？

答：总共分三步：第一步，添加节点；第二步，注册回调；第三步，正确更新红点值。

下面我们以未读邮件红点为例，来详细讲讲如何使用红点树的接口。

#### 第一步：调用addNode()方法，向红点树中添加节点

使用addNode()方法，添加节点的示例：

```TypeScript
// 添加MailButton父节点节点
redDotTree.addNode("MailButton");
// 根据邮件index，添加叶子节点
// 注：可以根据邮件的数量，添加很多个Mailx的叶子节点
redDotTree.addNode("MailButton/Mail" + this.mailIndex);

```

addNode()方法说明
需要讲解的是，我们通过“/”作为分隔符，用一个字符串，来表示从根节点到自节点的一系列节点
比如"MailButton/Mail1"，就表示“MailButton"是"Mail1"的父节点。

```TypeScript
/**
 * 向红点树中添加新的节点
 * 暂时不支持添加父节点还不存在的节点，比如要成功添加"MailButton/Mail1"，就要求"MailButton"已经被添加过
 * 为什么不设计成添加"MailButton/Mail1"时，自动添加"MailButton"节点呢？
 * 主要是考虑到了"MailButton"节点的isNum属性，未必和"MailButton/Mail1"相同
 * @param redDotPath 使用"/"作为分隔符的红点节点路径
 * @param isNum 为true，红点的取值就是非负整数；为false，红点的取值就是0或1
 * @returns 返回新添加的节点，如果添加失败，则返回null
*/
public addNode(redDotPath: string, isNum: boolean = true): RedDotTreeNode;
```

#### 第二步：调用registerCallback()方法，注册回调，用于监听特定节点的红点值变化

在主窗口中，我们关注的是父节点MailButton红点值的变化

```TypeScript
export class MainWindow extends Component {
  start () {
    // 主窗口打开时，注册回调
    // 注意这里的bind(this)，这样回调回来，才能有正确的this context
    redDotTree.registerCallback("MailButton", this.onMailRedDotChanged.bind(this));
  }

  private onMailRedDotChanged(redNum: number) {
    // 红点值红点大于0就可见
    this.mailRedDot.active = redNum > 0;
    // 红点节点上的红点值更新
    this.mailRedDotLabel.string = redNum.toString();
  }
}
```

在每一个ListItem，关注自己叶子节点的红点值变化

```TypeScript
export class ListItemMail extends Component {
  start () {
    // UI打开时注册回调
    // 只需要关注自己的mailIndex对应的红点节点的数值变化
    redDotTree.registerCallback("MailButton/Mail" + this.mailIndex, this.onRedNumChanged.bind(this));
  }

  private onRedNumChanged(redNum: number) {
    // 红点值红点大于0就可见
    this.redDotNode.active = redNum > 0;
  }
}
```

#### 第三步：数据变化时，修改叶子节点的红点值，UI即能收到回调

```TypeScript
export class ListItemMail extends Component {
  protected onClick() {
    // 点击之后，修改已读状态，即红点值变成0
    RedDotManager.redDotTree.changeRedDotState("MailButton/Mail" + this.index, false);
  }
}
```

这个时候，ListItemMail.onRedNumChanged()就可以收到回调了。

接口的使用介绍完毕，具体每个接口的详细细节，都在注释里，可以去这里查看：
[RedDotTree.ts](RedDotDemoCocos/assets/scripts/thirdParty/redDotTree/RedDotTree.ts)

### 可以改进的点

为了让这个例子尽量简单，有一些其他红点树方案实施的优化，我没有去实现。
感兴趣的读者可以自行实现或者是找其他的方案来进行参考。

#### 避免字符串的split操作，减少GC

"MailButton/Mail1"这个redDotPath，会被string.split()分为"MailButton", "Mail1"两个字字符串。
父节点的name是"MailButton"，子节点的name是"Mail1"。

优化方案：

每一个Node的节点，name属性不是split之后的新string，而是一个带着startIndex, endIndex，保存了原始string的类，比如

```TypeScript
class SomeString {
  // 原始string，比如"MailButton/Mail1"
  originString: string;
  // 记录subString在originString中的起始位置
  startIndex: number;
  // 记录subString在originString中的结束位置
  endIndex: number;
  // 需要自己实现equal(), find()等方法
}
```

使用上面这个类，就可以避免对string.split()的调用，可以复用redDotPath这个string，而不用分配新的string对象。

#### 一帧内，一个节点只被回调一次

* 每一个Node记录一个isDirty值
* 在红点值被修改的时候，不直接进行回调，而是标记isDirty为true
* 然后添加一个CallAllCallback()的方法。
* 在每一帧的Update的时候，去调用所有isDirty为true的Node的callback。

（其实正常的红点值变化回调里，主要是做一些简单的UI状态变化，只有你的界面因为红点的显示变化导致UI重建耗时比较大时，才值得来做这个优化）

### FAQ

等有了提问，我会在这里补充

## 单元测试使用

### Why 为什么写单元测试

所谓的单元测试，简单理解，就是写一些代码（构造输入，assert()一下输出是否如预期）来测试另一段代码能否正常工作。

给代码添加单元测试主要的优点就是快速发现bug，注意重点是“快速”：

* 开发自测阶段：不用真的运行游戏，就可以快速知道功能的执行结果
  * 常规的自测手段，运行游戏，进入到对应的UI，点击，观察，起码需要几十秒到几分钟
  * 运行单元测试，以我们的红点树的测试为例，只需要几秒钟，就能告诉你红点树的功能是否正确（单元测试是否全部绿灯通过）
* 日常维护阶段：通过在持续集成流水线中执行单元测试，可以第一时间知道什么时候旧的功能被改坏了
  * 正常情况，每次持续集成的单元测试，应该都是绿灯通过的状态
  * 如果有人不小心改坏了什么东西，那么第一时间，持续集成就能在失败的单元测试中发现问题

### How 如何运行单元测试

本demo单元测试的框架使用的是ts-jest。

为什么选用jest，主要是按照流行程度（GitHub的star排行），选择了jest，因为我们用的是TypeScript，就用了ts-jest，这个TypeScript版本的jest框架。

#### 1. yarn安装

如果你的机器上还没有安装过yarn，请参考官网链接，进行安装。
并且记得参考官网文档，将yarn添加到系统的PATH变量中。

<https://classic.yarnpkg.com/lang/en/docs/install>

#### 2. 第一次拉取到工程后，需要初始化

在RedDotDemoCocos/目录中，在命令行执行`yarn`命令

如果是Windows，遇到了下面的情况，就需要以管理员身份运行CMD：

```Bash
yarn : 无法加载文件 C:\Users\xxx\AppData\Roaming\npm\yarn.ps1，因为在此系统上禁止运行脚本。
```

#### 3. 运行单元测试

RedDotDemoCocos/目录中，命令行执行

`yarn jest`

执行成功之后，你会看到类似下面的输出（可以看到不到3秒钟，这个简单的单元测试就执行完毕了）

```Bash
Test Suites: 2 passed, 2 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        2.974 s, estimated 3 s
Ran all test suites.
✨  Done in 5.20s.
```

当然也可以在VSCode的Terminal里面，执行`yarn jest`来运行单元测试。

在Windows的VSCode中，你也会遇到下面的报错：

```Bash
yarn : 无法加载文件 C:\Users\xxx\AppData\Roaming\npm\yarn.ps1，因为在此系统上禁止运行脚本。
```

解决方法：

* 修改以管理员身份运行VSCode（具体方法可以去自行搜索）
* 执行：get-ExecutionPolicy，显示Restricted，需要执行下面的操作
  * 执行：set-ExecutionPolicy RemoteSigned
  * 再次执行：get-ExecutionPolicy，显示RemoteSigned，这样就OK了

#### 单元测试命名规则

jest是通过文件名，来判断一个代码文件是否是单元测试的测试代码的。
以.test.ts结尾的文件会被识别为单元测试代码。

## 其他

### Demo中使用的UI资源

UI资源是使用的AssetStore上面的免费资源
<https://assetstore.unity.com/packages/2d/gui/sci-fi-gui-skin-15606>
