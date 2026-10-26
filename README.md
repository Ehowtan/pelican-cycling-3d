# 🚲 鹈鹕骑行大冒险 3D (Pelican Coastal Cycling & Fish Catching 3D)

> **戴头盔墨镜、脖子系红围巾的酷炫鹈鹕在海岸公路上狂飙自行车抓鱼！**

体验集 3D 角色建模、物理着色器、 procedural 动画、纯 Web Audio 音频合成器与互动小游戏于一体的沉浸式 Web 3D 页面。

---

## 🌟 特色与能力全开 (Features & Technical Highlights)

1. **鹈鹕与自行车 3D 角色造型**：
   - **戴头盔 (Cycling Helmet)**：流线型空气动力学破风造型，带通风风道与电光青/荧光黄双色涂装。
   - **戴墨镜 (Reflective Sunglasses)**：黑超运动防风墨镜，带高反光与金属质感。
   - **系红围巾 (Dynamic Red Scarf)**：双环领结，两条飘带采用**高细分网格 + 真实风阻 Cloth Wave 顶点着色动画**，迎风剧烈翻飞。
   - **大嘴与喉囊 (Beak & Gullet)**：上下颌骨骼解剖级联动，捕鱼瞬间大嘴猛烈张开俯冲、喉囊极速扩张，吞下飞鱼后喉囊逼真鼓动颤抖！
   - **全拟真自行车结构**：车架、把手、刹把、双音铜车铃、前大灯、后警示灯、前后辐条轮毂、牙盘曲柄脚踏，双脚随脚踏旋转平滑联动踩踏。

2. **太平洋海岸公路无限景观 (Endless Coastal Highway)**：
   - 双车道柏油公路，带黄色边界线与白色虚线标线。
   - 动态海洋波浪系统（多倍频正弦波与微表面光泽反射）。
   - 海岸沙滩、悬崖巨石、棕榈树与公路警示牌。
   - 远方岬角上的经典红白灯塔（夜晚模式发射 360° 旋转探照灯柱）。

3. **抓鱼互动与连击系统 (Fish Catching Gameplay)**：
   - 飞鱼从海浪中呈抛物线跃入公路车道（包括稀有黄金金枪鱼）。
   - 左右操控变道，按空格键或点击屏幕张嘴大口抓鱼。
   - 连击加成机制（COMBO x2, x3...）、抓鱼水花与金币粒子飞散特效。
   - 自行车复古双音车铃（叮叮！），鸣铃可惊起飞鱼高高跃起。

4. **100% 纯 Web Audio 原创音频引擎 (Zero Dependencies)**：
   - 纯代码实时生成的海岸合成器背景音乐（清爽热带 Breezy Synth Chiptune）。
   - 真实粉红/白噪滤波海浪声波（LFO 低频呼吸起伏）。
   - 拟真机械链条棘轮踩踏滴答声与双音车铃。
   - 吞鱼吞咽声与水花金币泛音。

5. **四重摄影机机位与三大光影氛围**：
   - **视角切换**：📷 第三人称追随 / 😎 墨镜第一人称视角 / 🎬 电影侧拍全景 / 🌐 360° 自由航拍。
   - **光影氛围**：☀️ 晴空艳阳 / 🌅 绝美落日 / 🌃 赛博霓虹夜。

---

## 🎮 操作指南 (Controls)

| 按键 / 操作 | 动作 |
| :--- | :--- |
| **A / D** 或 **← / →** 或 **鼠标/触屏拖动** | 左右变道操控自行车 |
| **空格 Space** 或 **点击屏幕 / 抓鱼按钮** | 伸颈张开巨大喉囊吞掉飞鱼！ |
| **W / Shift** 或 **冲刺按钮** | 全力加速狂飙（触发破风速度线） |
| **S / ↓** | 减速滑行 |
| **B** 或 **铃铛按钮** | 敲响清脆双音车铃 (Ding-Ding!) |
| **C** 或 **视角按钮** | 切换 4 种摄影机机位 |
| **M** 或 **音乐按钮** | 开关背景音乐与环境海浪 |

---

## 🛠️ 技术栈 (Tech Stack)

- **Three.js** (WebGL 3D Rendering, PCFSoftShadowMap, ACESFilmicToneMapping)
- **Web Audio API** (Procedural Synthesis, Chiptune Sequencer, Noise Filters)
- **Modern CSS** (Glassmorphism, Viewport Units, Logical Properties)
- **Vanilla JavaScript** (Zero bloated frameworks, 60 FPS performance)
