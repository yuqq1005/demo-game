---
name: 人鬼之辨小游戏计划
overview: 改编自徐訏《鬼恋》的现代情感叙事小游戏，核心立意是"身份重构"与"人与鬼的边界之问"。采用 Art Deco + 黑色电影美学，单文件 HTML+CSS+JS，约8分钟单次体验，含3个结局+1个隐藏结局。
todos:
  - id: create_guilian_skeleton
    content: 创建 guilian/ 子目录及项目骨架
    status: pending
  - id: cover_opening
    content: 实现封面 + 开场便利店场景
    status: pending
  - id: chapter1_convenience_store
    content: 实现第一章：便利贴符号谜题 + 对话树
    status: pending
  - id: chapter2_apartment
    content: 实现第二章：老公寓 + 时钟谜题 + 多次见面切换
    status: pending
  - id: climax_cathedral
    content: 实现高潮：教堂重遇 + 真相揭露 + 三选项分支
    status: pending
  - id: three_endings
    content: 实现三种明确结局
    status: pending
  - id: hidden_ending
    content: 实现隐藏结局“黄粱”与触发条件
    status: pending
  - id: effects_audio
    content: 加入打字机效果、雨粒子、BGM
    status: pending
  - id: asset_replacement
    content: 等待用户提供10张图片后替换占位
    status: pending
  - id: cross_browser_test
    content: 浏览器与移动端适配测试
    status: pending
isProject: false
---

# 《人约黄昏》改编游戏实现计划

## 原作与改编立意

### 原作核心（徐訏《鬼恋》, 1937）
1930年代上海冬夜，记者"我"在烟铺偶遇一位自称是"鬼"的黑衣女子。女子学识渊博、气度非凡，与"我"相恋却始终拒绝结合——她坚称自己已是"鬼"，人鬼殊途。后来真相浮现：她出身大家族，曾参与革命组织，爱人被杀、同僚背叛，对人世彻底绝望后选择以"鬼"自居，从尘世消失。

### 改编定位（去政治化，重情感）
原作"无政府组织+复仇"的政治背景对20岁用户门槛太高。我保留最打动人心的三个母题：
- **身份重构**：受过重创后选择"换一种身份活着"
- **求而不得**：明明相爱却无法结合
- **人与鬼的边界**：什么算"活着"，什么算"死了"

### 现代版故事框架
**时间**：当代上海冬夜
**主角"我"**：25岁青年作家，陷入创作瓶颈，对现实生活感到麻木
**"她"**：30岁左右的黑衣女子，自称"鬼"，住在一栋老公寓里，行踪神秘，气质与"我"截然相反——她清醒、决绝、对一切无所求
**核心事件**：两人在深夜便利店相遇，"她"问"你愿意陪我做个实验吗？"，"我"答应。随后的相处是一段"人鬼相处"实验——她教"我"如何像"鬼"一样生活
**真相**：她其实不是鬼，而是多年前因一场意外"社会性死亡"的人（被所有人抛弃、失去身份），从此以"鬼"自居。"我"在相处中不知不觉被她改造，开始理解"做鬼"的自由与代价
**结局选择**：玩家决定"我"是回到"人"的世界，还是接受"她"的邀请继续"做鬼"

## 项目结构

```
d:\kuran\copy-code\vibeCoding\
├── guilian/
│   ├── index.html        # 单页面入口
│   ├── styles.css        # 美术风格与场景切换
│   ├── game.js           # 状态机 + 对话树 + 谜题逻辑
│   └── assets/           # 图片素材
│       ├── cover.jpg             # 1. 封面：黑色都市剪影 + 一盏路灯
│       ├── convenience_store.jpg # 2. 深夜便利店
│       ├── old_apartment.jpg     # 3. 老公寓走廊
│       ├── her_silhouette.jpg    # 4. "她"的黑衣剪影（关键立绘）
│       ├── her_face.jpg          # 5. "她"的近景侧脸（重要道具）
│       ├── city_night.jpg        # 6. 上海冬夜街景
│       ├── cathedral.jpg         # 7. 教堂内景（重逢场景）
│       ├── ending_a.jpg          # 8. 结局A·还魂
│       ├── ending_b.jpg          # 9. 结局B·入鬼
│       └── ending_c.jpg          # 10. 结局C·共度
```

## 视觉风格：Art Deco + 黑色电影

参考《人约黄昏》(1996年陈逸飞执导)的电影美学，但更现代：
- **色调**：深夜青黑色 + 钴蓝 + 暗金色点缀（霓虹灯感）
- **构图**：大量剪影与逆光，参考黑色电影
- **字体**：标题用细长 Art Deco 衬线体（如 Playfair Display），对话用现代细体
- **氛围元素**：
  - 持续飘落的细雨/雪粒
  - 路灯、雨伞、烟盒、便利店招牌
  - 玻璃反射、霓虹光晕
  - "她"永远穿黑色风衣，戴帽

## 文件职责

### index.html
- 根容器 `#game-container`（全屏黑底）
- 场景容器：`.scene` 通用样式，通过 JS 切换
- 场景列表：
  - `#scene-cover` - 封面（标题+开始按钮）
  - `#scene-opening` - 开场：深夜便利店
  - `#scene-chapter1` - 第一章：便利店相遇
  - `#scene-chapter2` - 第二章：跟随她回家（老公寓）
  - `#scene-chapter3` - 第三章：相处实验（多次见面）
  - `#scene-climax` - 高潮：教堂重逢 / 真相揭露
  - `#scene-ending-a/b/c/hidden` - 四种结局
  - `#scene-credits` - 片尾
- 通用元素：底部对话框 `#dialogue-box`、顶部进度点 `#progress-dots`、BGM控制按钮 `#mute-btn`

### styles.css
- CSS 变量定义色板：`--night: #0a0e1a` / `--blue: #1a3a5c` / `--gold: #c9a961` / `--ink: #1a1a1a`
- 场景切换动画：黑屏淡入淡出（1000ms），强化戏剧感
- 打字机效果：等宽字符逐字显现（30ms/字）
- 雨/雪粒子：CSS animation 实现的细小白点持续下落
- 霓虹光晕：`box-shadow` + `text-shadow` 多层叠加
- 角色立绘切换：`opacity` + `transform: translateX()` 滑入
- 移动端：自适应宽度，立绘改为小尺寸

### game.js
- 状态对象 `gameState = { chapter, affinity: 0, choices: [], unlockedEndings: new Set(), secretPath: false }`
- `affinity` 亲密度：0-100，影响结局走向与对话选项
- 场景渲染函数：`renderScene(id)`
- 对话树数据结构：
  ```
  dialogue[id] = {
    speaker: "narrator" | "her" | "me",
    text: "...",
    options: [
      { label: "...", nextId: "...", affinityDelta: +5 }
    ]
  }
  ```
- 谜题逻辑：
  - **谜题1·影子拼图**：在便利店场景中，点击画面不同位置收集"她"留在便利贴上的4个符号（雨滴/猫/钟/窗），按正确顺序点击触发对话推进
  - **谜题2·时钟倒推**：在她家的墙上有一只停摆的钟，玩家需要按时间顺序（从早到晚或反过来）点击墙上的3张老照片才能打开"她的房间"

## 剧情节奏（约8分钟）

### 封面（15秒）
- 黑屏渐亮：上海冬夜俯瞰，霓虹模糊
- 标题逐字浮现："人 约 黄 昏"
- 副标题："有些相遇，是两个世界的人错走到了一起"
- 按钮："开始值夜"

### 开场·便利店相遇（60秒）
- 玩家视角：刚结束与出版社编辑的争吵，从咖啡店出来走进24小时便利店
- 货架间看到一位黑衣女子独自购物
- 她回过头——只有剪影，没有脸
- 她说："你要的咖啡是第三排左边数第二罐。"
- 玩家惊讶（她怎么知道？）
- 她："别惊讶。这只是因为我和你买的是同一种。"
- 她留一张黑色名片在柜台上："深夜无聊的话，来斜土路找我。"（致敬原作地名）
- 玩家可选择"收起名片"或"留在柜台"（影响后续）

### 第一章·第一次登门（2分钟）
- 玩家跟随她来到老公寓
- 公寓走廊场景：她开门，玩家看到满屋子的旧书、老照片、停摆的钟
- 对话树展开：
  - 她："你想不想做个实验？"
  - 选项A："什么实验？"（+5 亲密度）
  - 选项B："你为什么要做实验？"（+3）
  - 选项C："我只是个路人。"（-5）
- 谜题2触发：时钟谜题解锁后，她打开房间
- 房间内部：极简，一张床、一面镜子、一盏落地灯

### 第二章·相处实验（2.5分钟）
- 多次见面切换（用淡入淡出表示时间推移）
- 每次见面她教"我"一项"做鬼"的方法：
  - 第1次：如何不被别人的评价影响
  - 第2次：如何在一个地方消失（不被任何人找到）
  - 第3次：如何对所有事"无所谓"
- 每次见面后，玩家选择：
  - 选项A："我学会了"（+10 亲密度，走向入鬼结局）
  - 选项B："我觉得这样不对"（-10，走向还魂结局）
  - 选项C："我更想了解你"（+5，走向共度结局）
- 在第3次见面后，玩家需要回答她的问题："你觉得，做人好还是做鬼好？"

### 高潮·教堂重逢（1.5分钟）
- 时间跳转：一个月后
- 玩家被告知她"消失"了，斜土路的公寓也空了
- 玩家在城市的各个角落（教堂/旧货市场/深夜便利店）寻找她
- 谜题3（可选）：在教堂彩窗上点击不同颜色玻璃，拼出她留下的隐喻符号
- 最终在教堂找到她，她坐在最后一排
- 她讲出真相：多年前她因家庭变故被所有人抛弃，从一个"人"变成了"鬼"——她把所有社会关系都切断了
- 她问你："你愿意继续做'人'，还是……"
- 选项：
  - "我要回到'人'的世界"（→结局A）
  - "我想和你一样做'鬼'"（→结局B）
  - "我们一起，做第三种人"（→结局C，需 affinity≥70 才出现）

### 结局（每种30-60秒）

**结局A·还魂（人间）**
- 画面切回便利店，阳光明媚
- 玩家手中的名片还在，但字迹已模糊
- 字幕："有些人注定是过客。但你学会了她给你的礼物。"
- 最终画面："她教会了你如何在人世间，保持'鬼'的清醒。"

**结局B·入鬼（消失）**
- 画面切换：玩家穿上黑色风衣，走入雨中
- 背影渐行渐远
- 字幕："从今天起，世界上多了两个'鬼'。"
- 隐藏细节：玩家手机屏幕碎裂，所有联系人列表为空——"已删除所有人"

**结局C·共度（第三种可能）**
- 画面：她和玩家站在公寓窗前，雨已经停了
- 她摘下帽子，第一次露出全脸（立绘正面）
- 她："其实'人'和'鬼'，只是同一个人的白天和夜晚。"
- 玩家："那我们就是——"
- 她："——做彼此的黄昏。"
- 字幕："从此以后，他们轮流做对方的'人'与'鬼'。"

**隐藏结局·黄粱**
- 触发条件：玩家在第一章选择"留在柜台"+ 第三章选择结局B + 全程未触发任何谜题
- 画面：玩家醒来，发现自己躺在便利店地板上
- 黑衣女子从未出现过——所有对话都是"我"自己的内心独白
- 字幕："也许这个世界上，从来没有'鬼'。只有不愿做'人'的自己。"
- 极端解构主义彩蛋

### 片尾
- "献给所有曾想消失，也曾被找回的人。"
- 显示已解锁结局数 + 重玩按钮

## 关键技术细节

- **打字机效果**：基于 `requestAnimationFrame` 的逐字渲染，比 `setInterval` 更流畅
- **场景切换**：全黑遮罩 + `setTimeout(1000)` 后 DOM 切换，避免视觉撕裂
- **BGM**：用 Web Audio API 合成钢琴+环境音（雨声/城市低频），避免依赖外部 mp3
- **雨/雪粒子**：CSS `@keyframes` 实现，性能优于 canvas
- **响应式**：CSS Grid + clamp()，桌面与移动端自适应
- **状态持久化**：localStorage 存储 unlockedEndings 与 affinity 历史最高值

## 美术资源（你需要生成的图，共10张）

### 图1：封面（cover.jpg）
**English prompt**:
`Cinematic wide shot of a rainy Shanghai night street from above, art deco style neon signs in cobalt blue and dim gold, a single warm streetlamp glowing in the middle distance, a lone black silhouette of a person holding an umbrella, film noir atmosphere, painterly style, 4K, moody palette`

**中文描述**:
俯瞰上海雨夜街道，Art Deco 风格霓虹灯钴蓝与暗金色，远处一盏温暖路灯孤独亮着，一个打伞黑色人影，电影黑色氛围，绘画风

### 图2：便利店（convenience_store.jpg）
**English prompt**:
`Interior of a 24-hour convenience store at night, fluorescent lighting mixed with neon glow from outside, wet footprints on tile floor, empty aisle seen through shelves of products, lonely atmosphere, cinematic, art deco lighting accents, 4K`

**中文描述**:
深夜24小时便利店内部，荧光灯与外霓虹混合光，瓷砖地面湿脚印，透过货架看到的空荡过道，孤独氛围，电影感 Art Deco 打光

### 图3：老公寓走廊（old_apartment.jpg）
**English prompt**:
`Long narrow corridor of an old 1920s Shanghai apartment building at night, dim warm wall lamps, peeling paint on walls, a single closed door at the end with light leaking underneath, mysterious and nostalgic atmosphere, art deco architectural details, cinematic, painterly`

**中文描述**:
上海1920年代老公寓长走廊夜景，昏暗暖色壁灯，墙面斑驳剥落，尽头一扇紧闭的门下漏出光，神秘怀旧氛围，Art Deco 建筑细节

### 图4："她"的黑衣剪影（her_silhouette.jpg）—— 关键立绘
**English prompt**:
`Full body silhouette of a slender Asian woman in her late 20s wearing a long black trench coat and wide-brimmed hat, standing against a backlit rainy window, only outline visible, no facial features, mysterious and elegant, art deco framing, cinematic, high contrast`

**中文描述**:
20多岁纤细亚洲女子全身剪影，穿黑色长风衣戴宽檐帽，背光雨中窗前，只有轮廓无面部特征，神秘优雅，Art Deco 框景，电影感高对比

### 图5："她"的近景侧脸（her_face.jpg）—— 关键道具
**English prompt**:
`Close-up side profile of a young Asian woman, sharp jawline, slightly melancholic expression, wearing a black turtleneck, soft backlight creating a halo around her hair, art deco style, cinematic color grading with cobalt and gold tones, painterly, shallow depth of field`

**中文描述**:
年轻亚洲女子侧脸特写，锐利下颌线，略带忧郁表情，穿黑色高领，背光形成发丝光晕，Art Deco 风格，电影感钴蓝金色调，浅景深

### 图6：上海冬夜街景（city_night.jpg）
**English prompt**:
`Atmospheric Shanghai winter night street, wet cobblestone reflecting neon lights, art deco building facades, foggy rain, a single vintage streetlamp in the foreground, lonely and poetic mood, cinematic wide shot, painterly, muted cobalt and amber palette`

**中文描述**:
上海冬夜街道氛围，雨雾湿鹅卵石反射霓虹光，Art Deco 建筑立面，雾雨，前景一盏复古路灯，孤独诗意，电影感宽景，钴蓝与琥珀色

### 图7：教堂内景（cathedral.jpg）
**English prompt**:
`Interior of an old European-style cathedral at night, dim warm light filtering through stained glass windows in art deco geometric patterns, empty wooden pews, a single figure sitting in the last row as silhouette, sacred and mysterious atmosphere, cinematic, painterly`

**中文描述**:
欧式老教堂内部夜景，暖光透过 Art Deco 几何图案彩窗，空木长椅，最后一排一黑色人影剪影，神圣神秘氛围，电影感，绘画风

### 图8-10：三种结局意境图

**结局A·还魂（人间）**:
**English prompt**:
`Daytime convenience store interior with warm morning sunlight streaming through windows, a single black business card lying on the counter, the card text intentionally blurred, hopeful but melancholic atmosphere, art deco lighting, cinematic, painterly`

**中文描述**:
白天便利店内部温暖晨光透过窗户，柜台上单独一张黑色名片字迹模糊，希望但带忧郁的氛围，Art Deco 打光

**结局B·入鬼（消失）**:
**English prompt**:
`A solitary figure in black trench coat with hat walking away into heavy rain on an empty Shanghai street at night, viewed from behind, reflections on wet cobblestones, melancholic and decisive mood, cinematic, art deco, painterly`

**中文描述**:
黑衣风衣戴帽孤独人影背对画面走入上海雨夜空街，湿鹅卵石反射，忧郁决绝氛围，电影感 Art Deco

**结局C·共度（黄昏）**:
**English prompt**:
`Two silhouettes standing side by side in front of a tall rain-streaked window, warm interior light behind them, one slightly taller than the other, intimate yet melancholic mood, art deco framing, cinematic painterly style, golden hour color palette`

**中文描述**:
两个人影并肩站在雨迹高窗前，背后温暖室内光，一高一矮，亲密而忧郁，Art Deco 框景，金色调

## 实现步骤

1. **创建项目骨架**（`guilian/` 子目录）
2. **搭建 HTML+CSS+JS 框架**，先实现封面与开场切换
3. **实现第一章**：便利店场景 + 对话树 + 名片选择
4. **实现第二章**：公寓场景 + 时钟谜题 + 多次见面切换
5. **实现高潮**：教堂场景 + 三选项结局分流
6. **实现 3 个明确结局** + 1 个隐藏结局
7. **加入打字机效果 + 雨/雪粒子 + BGM**
8. **等待用户图片**，替换占位背景并微调视觉
9. **跨浏览器 + 移动端测试**

## 与原"图书馆"计划的差异

| 维度 | 图书馆计划 | 人鬼之辨计划 |
|---|---|---|
| 文件位置 | 根目录 `index.html` 等 | `guilian/` 子目录，独立项目 |
| 主题 | 内向哲学反思（记忆） | 外向情感抉择（身份） |
| 视觉风格 | 暖黄复古 | Art Deco 黑色电影 |
| 互动重点 | 拼句子解谜 | 对话树亲密度 |
| 情绪曲线 | 内敛、顿悟 | 张力、悬疑、释然 |
| 主角设定 | 图书馆夜班员 | 25岁青年作家 |

两个计划完全独立，可以任选其一先实现，也可以两个都做（作为同一个 workspace 下的两个小游戏项目）。

## 文件路径汇总

- [guilian/index.html](guilian/index.html) - 入口
- [guilian/styles.css](guilian/styles.css) - 样式
- [guilian/game.js](guilian/game.js) - 游戏逻辑
- [guilian/assets/](guilian/assets/) - 图片素材

## 完成判定

- 单次游戏 7-10 分钟
- 3 个明确结局 + 1 个隐藏结局均可达
- 亲密度系统影响剧情分支与隐藏选项
- localStorage 持久化已解锁结局与历史最高亲密度
- Chrome/Edge/Firefox 桌面 + 移动端均流畅运行