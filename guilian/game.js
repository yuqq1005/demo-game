/* ============================================
   人约黄昏 · A Date with the Ghost
   核心逻辑：状态机 + 对话树 + 谜题 + 结局分支
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // 全局状态
  // ============================================
  const gameState = {
    affinity: 0,            // 亲密度 0-100
    chapter: 0,             // 0=封面 1=开场 2=第一章 3=第二章 4=高潮
    choiceHistory: [],      // 玩家选择历史
    cardChoice: null,       // 'keep' | 'leave'
    puzzleSolved: false,    // 第二章谜题
    choseTruth: false,      // 高潮是否问了"是什么鬼"
    ending: null,           // 'a' | 'b' | 'c' | 'h'
    unlockedEndings: new Set(),
    secretPath: false,      // 是否触发隐藏结局路径
    noPuzzleFlags: 0,       // 跳过谜题次数
  };

  // ============================================
  // 存档（localStorage）
  // ============================================
  const STORAGE_KEY = 'guilian_save_v1';
  const ENDING_KEY = 'guilian_endings_v1';

  function saveProgress() {
    try {
      const data = {
        affinity: gameState.affinity,
        unlockedEndings: Array.from(gameState.unlockedEndings),
      };
      localStorage.setItem(ENDING_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('存档失败:', e);
    }
  }

  function loadProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(ENDING_KEY) || '{}');
      if (data.unlockedEndings) {
        gameState.unlockedEndings = new Set(data.unlockedEndings);
      }
    } catch (e) {
      console.warn('读档失败:', e);
    }
  }

  function recordEnding(id) {
    gameState.unlockedEndings.add(id);
    saveProgress();
  }

  // ============================================
  // 音频（MP3 文件播放）
  // ============================================
  let bgmAudio = null;
  let isMuted = false;

  function initAudio() {
    // 不再需要 Web Audio API，音频由 <audio> 元素处理
  }

  function startBGM() {
    if (bgmAudio) return;
    if (isMuted) return;

    bgmAudio = new Audio('musics/Goldmund - unbraiding the sun.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.4;
    bgmAudio.play().catch(e => console.warn('BGM 播放失败:', e));
  }

  function stopBGM() {
    if (!bgmAudio) return;
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio = null;
  }

  function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('mute-btn').classList.toggle('muted', isMuted);
    if (bgmAudio) {
      bgmAudio.muted = isMuted;
    }
  }

  // ============================================
  // 场景切换
  // ============================================
  function switchScene(targetId) {
    const scenes = document.querySelectorAll('.scene');
    const mask = document.getElementById('black-mask');

    // 显示黑屏
    mask.classList.add('active');

    setTimeout(() => {
      scenes.forEach((s) => {
        s.dataset.active = (s.id === targetId) ? 'true' : 'false';
      });
      // 隐藏黑屏
      setTimeout(() => {
        mask.classList.remove('active');
      }, 100);
    }, 500);
  }

  // ============================================
  // 打字机效果
  // ============================================
  function typeText(element, text, speed = 35) {
    return new Promise((resolve) => {
      element.textContent = '';
      element.classList.add('typing');
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text[i];
          i++;
        } else {
          clearInterval(timer);
          element.classList.remove('typing');
          resolve();
        }
      }, speed);
    });
  }

  // ============================================
  // 封面 → 开场
  // ============================================
  function startGame() {
    initAudio();
    startBGM();
    gameState.chapter = 1;
    updateProgress();
    switchScene('scene-opening');
    playOpeningSequence();
  }

  function playOpeningSequence() {
    const lines = document.querySelectorAll('.narrator-line');
    const silhouette = document.getElementById('opening-silhouette');
    const continueBtn = document.querySelector('.opening-continue');

    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('visible');
        if (i === 5) {
          // 最后一行出现时显示剪影
          setTimeout(() => {
            silhouette.classList.add('visible');
          }, 600);
        }
        if (i === lines.length - 1) {
          setTimeout(() => {
            continueBtn.hidden = false;
            continueBtn.classList.add('fade-in');
          }, 1200);
        }
      }, i * 1100);
    });
  }

  function openingContinue() {
    gameState.chapter = 2;
    updateProgress();
    switchScene('scene-chapter1');
    initChapter1();
  }

  // ============================================
  // 第一章：便利店对话树
  // ============================================
  const chapter1Dialogue = {
    // ── 场景1：便利店入口 ──
    enter: {
      speaker: '叙述',
      text: '湿漉漉的玻璃门，冰凉得像一块冰。\n' +
            '霓虹灯从外面透进来，在货架上投下红蓝色的斑块，\n' +
            '像一池被打碎的水银。\n\n' +
            '空气里弥漫着廉价香烟和关东煮汤底的味道。\n' +
            '收音机里放着周璇的《何日君再来》，断断续续，像是在哭。',
      options: [
        { label: '往货架深处走', next: 'q1a', affinity: 0 },
        { label: '径直走向收银台', next: 'q1b', affinity: 0 },
        { label: '在门口站一会儿，抽根烟', next: 'q1c', affinity: 0 },
      ],
    },
    q1a: {
      speaker: '叙述',
      text: '你往货架深处走去。\n' +
            '第三排。左边数第二罐。\n' +
            '——就是它了。\n' +
            '你伸手去拿，指尖碰到了另一只手。\n\n' +
            '那只手冰得像刚从冷水里捞出来的玉。',
      options: [
        { label: '回头看', next: 'q1a_face', affinity: 3 },
        { label: '假装什么都没发生，拿起咖啡', next: 'q1a_awkward', affinity: -1 },
      ],
    },
    q1a_face: {
      speaker: '她',
      text: '她站在你身后。\n' +
            '皮肤白得不真实，像是很久没见过阳光。\n' +
            '穿着一件黑色风衣，戴着宽檐帽，帽檐压得很低。\n\n' +
            '她松开手，退后一步。\n' +
            '"你常喝这个？"',
      showFace: true,
      options: [
        { label: '……你怎么知道？', next: 'q2a', affinity: 3 },
        { label: '你也喜欢这个牌子？', next: 'q2b', affinity: 5 },
        { label: '你是这家店的人？', next: 'q2c', affinity: -2 },
      ],
    },
    q1a_awkward: {
      speaker: '她',
      text: '你拿起咖啡，转身走开。\n\n' +
            '但你感觉背后有目光在追着你。\n' +
            '不是收银台的目光。\n' +
            '是从货架深处投来的。\n\n' +
            '你回头——\n' +
            '什么都没有。只有雨声。',
      options: [
        { label: '走向收银台', next: 'q1b', affinity: 0 },
      ],
    },
    q1b: {
      speaker: '叙述',
      text: '你径直走向收银台。\n' +
            '你要了一包烟。\n' +
            '收银员是个睡眼惺忪的中年女人，头也不抬。\n\n' +
            '就在这时，门被推开了。\n' +
            '一个穿黑色风衣的女人走进来。\n' +
            '带着一身雨气和一种说不清的气息。',
      options: [
        { label: '盯着她看', next: 'q1b_stare', affinity: 2 },
        { label: '假装没看见，低头点烟', next: 'q1b_ignore', affinity: 0 },
      ],
    },
    q1b_stare: {
      speaker: '她',
      text: '她径直走向冷柜。\n' +
            '拿了一瓶矿泉水，然后又放回去。\n' +
            '又拿起来，又放回去。\n\n' +
            '她似乎感觉到了你的目光。\n' +
            '她回过头，看着你。\n' +
            '"看什么？"',
      showFace: true,
      options: [
        { label: '……没什么。', next: 'q1b_stare2', affinity: 1 },
        { label: '你看起来不像是来买东西的。', next: 'q1b_stare2', affinity: 4 },
      ],
    },
    q1b_stare2: {
      speaker: '她',
      text: '她笑了一下。\n' +
            '那个笑容——\n' +
            '像是从很深很深的井底打捞上来的。\n\n' +
            '"我常来。\n' +
            '深夜无聊的时候，就来逛逛。"',
      options: [
        { label: '……你怎么知道我会选这个？', next: 'q2a', affinity: 3 },
        { label: '你也喜欢这个牌子？', next: 'q2b', affinity: 5 },
        { label: '你是这家店的人？', next: 'q2c', affinity: -2 },
      ],
    },
    q1b_ignore: {
      speaker: '叙述',
      text: '你低下头，点了根烟。\n\n' +
            '蓝色的烟雾在霓虹灯下升起来。\n' +
            '你听到脚步声在你身边停下。\n' +
            '很近。\n' +
            '然后是一个声音——\n\n' +
            '"你点烟的样子，很像一个我认识的人。"',
      options: [
        { label: '……你认识我？', next: 'q1b_ignore2', affinity: 4 },
        { label: '小姐，我们不认识吧。', next: 'q1b_ignore2', affinity: -1 },
      ],
    },
    q1b_ignore2: {
      speaker: '她',
      text: '她摇摇头。\n' +
            '"不认识。\n' +
            '但深夜无聊的人，我都认识。"',
      showFace: true,
      options: [
        { label: '……你怎么知道我会选这个？', next: 'q2a', affinity: 3 },
        { label: '你也喜欢这个牌子？', next: 'q2b', affinity: 5 },
        { label: '你是这家店的人？', next: 'q2c', affinity: -2 },
      ],
    },
    q1c: {
      speaker: '叙述',
      text: '你站在门口，点了一根烟。\n' +
            '风从门缝里挤进来，带着雨腥气。\n' +
            '你深吸一口，看着烟雾被风吹散。\n\n' +
            '这时候，你注意到——\n' +
            '门外的雨里站着一个人。\n' +
            '黑衣，黑帽，一动不动。\n\n' +
            '但她没有撑伞。',
      options: [
        { label: '推开门，问她要不要进来避雨', next: 'q1c_ask', affinity: 5 },
        { label: '隔着玻璃看着她', next: 'q1c_watch', affinity: 2 },
      ],
    },
    q1c_ask: {
      speaker: '她',
      text: '门开了。\n' +
            '她没有进来，只是站在门口。\n' +
            '雨水顺着她的帽檐滴下来。\n\n' +
            '"不用。\n' +
            '我就是在等雨。"',
      showFace: true,
      options: [
        { label: '……你在等什么？', next: 'q2a', affinity: 4 },
        { label: '那你进来坐坐吧。', next: 'q2b', affinity: 5 },
        { label: '神经病。', next: 'q2c', affinity: -3 },
      ],
    },
    q1c_watch: {
      speaker: '叙述',
      text: '你隔着玻璃看着她。\n' +
            '她也在看着你。\n' +
            '隔着雨幕，隔着霓虹灯。\n\n' +
            '然后，她笑了。\n' +
            '推门走了进来。\n\n' +
            '"你很有意思。\n' +
            '别人都是急着避雨，你却在看别人淋雨。"',
      showFace: true,
      options: [
        { label: '……你怎么知道我会选这个？', next: 'q2a', affinity: 3 },
        { label: '你也喜欢这个牌子？', next: 'q2b', affinity: 5 },
        { label: '你是这家店的人？', next: 'q2c', affinity: -2 },
      ],
    },
    // ── 场景2：核心对话 ──
    q2a: {
      speaker: '她',
      text: '因为你刚和编辑吵完架。\n' +
            '走进来的时候，脸上写着"我要逃避"。\n' +
            '——而那个牌子，是逃避者最常选的。',
      options: [
        { label: '……你观察得很仔细。', next: 'q3', affinity: 5 },
        { label: '你谁啊？', next: 'q3', affinity: -3 },
      ],
    },
    q2b: {
      speaker: '她',
      text: '不。\n' +
            '我只喝白水。\n' +
            '但我知道，人在深夜买的东西，\n' +
            '和白天买的不一样。\n' +
            '白天买的是需要，深夜买的是——\n' +
            '——出口。',
      options: [
        { label: '……出口？', next: 'q3', affinity: 5 },
        { label: '那你呢？你的深夜出口是什么？', next: 'q3_special', affinity: 8 },
      ],
    },
    q3_special: {
      speaker: '她',
      text: '她沉默了一会儿。\n' +
            '然后说：\n\n' +
            '"等一个人。\n' +
            '等一个和我一样，深夜无聊的人。"',
      options: [
        { label: '……你等到了吗？', next: 'q3', affinity: 8 },
      ],
    },
    q2c: {
      speaker: '她',
      text: '我路过。\n' +
            '我不卖任何东西。',
      options: [
        { label: '抱歉，我失态了。', next: 'q3', affinity: 3 },
        { label: '……那你买什么？', next: 'q3', affinity: 1 },
      ],
    },
    q3: {
      speaker: '她',
      text: '她从口袋里拿出一包没有牌子的烟。\n' +
            '抽出一根，点上。\n' +
            '蓝色的烟雾在她脸上散开。\n\n' +
            '"深夜无聊的话——\n' +
            '来斜土路找我。\n' +
            '那栋老公寓，七楼，最里面的门。"',
      lockCard: true,
    },
    cardPrompt: {
      speaker: '叙述',
      text: '她把一张黑色名片留在柜台上。\n' +
            '然后转身，消失在货架之间。\n\n' +
            '你低头看那名片——\n' +
            '不是普通的纸。是宣纸。有墨香。\n' +
            '上面只印了几个字：\n' +
            '"深夜无聊的人，我都收留。"',
      cardChoice: true,
    },
    cardKept: {
      speaker: '叙述',
      text: '你把名片收进口袋。\n' +
            '指尖触到纸的质地——温热的，像有人刚刚握过。\n' +
            '你回头想再看她一眼。\n\n' +
            '但货架之间空无一人。\n' +
            '只有雨声。\n' +
            '只有霓虹灯。\n\n' +
            '还有街灯突然闪了一下。\n' +
            '像是眨了一下眼睛。',
      options: [
        { label: '你决定去。', next: 'ch1_end_go', affinity: 8 },
        { label: '你犹豫。', next: 'ch1_end_hesitate', affinity: 3 },
      ],
    },
    cardLeft: {
      speaker: '叙述',
      text: '你把名片留在柜台上。\n\n' +
            '正要转身离开，收银员叫住了你：\n\n' +
            '"小姐说——\n' +
            '如果你不拿，她明天还会来。\n' +
            '后天也来。\n' +
            '大后天也来。"\n\n' +
            '你拿起了名片。',
      autoContinue: 'ch1_end_hesitate',
    },
    ch1_end_go: {
      speaker: '叙述',
      text: '凌晨两点。\n' +
            '你站在斜土路老公寓的门口。\n' +
            '按下了门铃。\n\n' +
            '铃声是教堂的那种——\n' +
            '"铛——。\n' +
            '铛——。"\n\n' +
            '你等了很久。\n' +
            '久到你以为自己来错了地方。\n\n' +
            '然后，门开了。',
      options: [
        { label: '继续', next: 'CH2', final: true },
      ],
    },
    ch1_end_hesitate: {
      speaker: '叙述',
      text: '凌晨两点。\n' +
            '你躺在床上，翻来覆去睡不着。\n' +
            '枕头旁边放着那张名片。\n' +
            '月光照在上面，那几个字好像在发亮。\n\n' +
            '你最终还是起了床。\n' +
            '穿上风衣，走进雨里。\n\n' +
            '斜土路老公寓。\n' +
            '七楼，最里面的门。\n\n' +
            '门铃——\n' +
            '"铛——。\n' +
            '铛——。"\n\n' +
            '门开了。',
      options: [
        { label: '继续', next: 'CH2', final: true },
      ],
    },
  };

  function initChapter1() {
    // 显示角色立绘（剪影）
    const stage = document.getElementById('ch1-character');
    stage.classList.add('silhouette');

    // 开始对话（从新入口节点开始）
    renderDialogue('ch1', chapter1Dialogue.enter);
  }

  function renderDialogue(chapter, node) {
    const prefix = chapter === 'climax' ? 'climax' : chapter;
    const speakerEl = document.getElementById(
      chapter === 'climax' ? 'speaker-name-climax' : `speaker-name${chapter === 'ch2' ? '-ch2' : ''}`
    );
    const textEl = document.getElementById(
      chapter === 'climax' ? 'dialogue-text-climax' : `dialogue-text${chapter === 'ch2' ? '-ch2' : ''}`
    );
    const optionsEl = document.getElementById(
      chapter === 'climax' ? 'option-list-climax' : `option-list${chapter === 'ch2' ? '-ch2' : ''}`
    );
    const continueBtn = document.getElementById(
      chapter === 'climax' ? 'dialogue-continue-climax' : `dialogue-continue${chapter === 'ch2' ? '-ch2' : ''}`
    );

    speakerEl.textContent = node.speaker;
    optionsEl.innerHTML = '';
    continueBtn.hidden = true;

    // 人脸揭示：showFace 时切换立绘从剪影到真脸
    if (node.showFace) {
      const stage = document.getElementById(chapter === 'climax' ? 'climax-character' : 'ch2-character');
      if (stage) {
        stage.classList.remove('silhouette');
        stage.classList.add('face');
      }
    }

    // 背景切换：支持对话节点动态切换背景图
    if (node.bg) {
      const activeScene = document.querySelector('.scene[data-active="true"]');
      if (activeScene) {
        const bg = activeScene.querySelector('.scene-bg');
        if (bg) {
          bg.style.backgroundImage = `url('assets/${node.bg}')`;
          bg.classList.add('has-image');
        }
      }
    }

    // 隐藏角色立绘：某些特殊背景图不需要角色叠加
    if (node.noCharacter) {
      const stage = document.getElementById(chapter === 'climax' ? 'climax-character' : 'ch2-character');
      if (stage) {
        stage.style.display = 'none';
      }
    } else {
      const stage = document.getElementById(chapter === 'climax' ? 'climax-character' : 'ch2-character');
      if (stage) {
        stage.style.display = '';
      }
    }

    if (node.lockCard) {
      // 进入名片选择
      renderDialogue(chapter, chapter1Dialogue.cardPrompt);
      return;
    }

    if (node.cardChoice) {
      // 显示名片选择 UI
      textEl.textContent = node.text;
      optionsEl.innerHTML = '';
      const btnKeep = document.createElement('button');
      btnKeep.className = 'option-btn';
      btnKeep.textContent = '· 收起来';
      btnKeep.onclick = () => {
        gameState.affinity += 2;
        gameState.cardChoice = 'keep';
        renderDialogue(chapter, chapter1Dialogue.cardKept);
      };
      const btnLeave = document.createElement('button');
      btnLeave.className = 'option-btn';
      btnLeave.textContent = '· 留在柜台';
      btnLeave.onclick = () => {
        gameState.cardChoice = 'leave';
        gameState.secretPath = true;  // 触发隐藏结局路径
        renderDialogue(chapter, chapter1Dialogue.cardLeft);
      };
      optionsEl.appendChild(btnKeep);
      optionsEl.appendChild(btnLeave);
      return;
    }

    if (node.autoContinue) {
      typeText(textEl, node.text).then(() => {
        setTimeout(() => {
          const nextNode = chapter1Dialogue[node.autoContinue] ||
                          chapter2Dialogue[node.autoContinue] ||
                          climaxDialogue[node.autoContinue];
          renderDialogue(chapter, nextNode);
        }, 800);
      });
      return;
    }

    typeText(textEl, node.text).then(() => {
      if (node.options) {
        node.options.forEach((opt) => {
          const btn = document.createElement('button');
          btn.className = 'option-btn';
          btn.textContent = '· ' + opt.label;
          if (opt.locked) {
            btn.classList.add('locked');
          } else {
            btn.onclick = () => {
              // 亲密度门槛检查
              if (opt.lockedBy && gameState.affinity < opt.lockedBy) {
                const lockedHint = document.createElement('p');
                lockedHint.className = 'puzzle-status';
                lockedHint.textContent = `（亲密度不足，需要 ${opt.lockedBy}）`;
                optionsEl.appendChild(lockedHint);
                return;
              }
              gameState.affinity += opt.affinity || 0;
              gameState.choiceHistory.push(opt.label);
              if (opt.final) {
                // 进入下一章
                if (chapter === 'ch1') {
                  initChapter2();
                } else if (chapter === 'ch2') {
                  initClimax();
                } else if (chapter === 'climax') {
                  triggerEnding(opt.next);
                }
              } else {
                const dialogTree = chapter === 'ch1' ? chapter1Dialogue :
                                  chapter === 'ch2' ? chapter2Dialogue :
                                  climaxDialogue;
                renderDialogue(chapter, dialogTree[opt.next]);
              }
            };
          }
          optionsEl.appendChild(btn);
        });
      } else if (node.autoContinue) {
        continueBtn.hidden = false;
        continueBtn.onclick = () => {
          const dialogTree = chapter === 'ch1' ? chapter1Dialogue :
                            chapter === 'ch2' ? chapter2Dialogue :
                            climaxDialogue;
          renderDialogue(chapter, dialogTree[node.autoContinue]);
        };
      } else {
        continueBtn.hidden = false;
        continueBtn.onclick = () => {
          if (chapter === 'ch1') {
            initChapter2();
          } else if (chapter === 'ch2') {
            initClimax();
          }
        };
      }
    });
  }

  // ============================================
  // 第二章：公寓对话 + 时钟谜题
  // ============================================
  const chapter2Dialogue = {
    intro: {
      speaker: '叙述',
      text: '公寓里很暗。\n' +
            '老式电梯的铁栅栏门拉上的时候，\n' +
            '镜子里映出你变形的倒影。\n\n' +
            '楼道里有樟脑丸、桂花和猫屎混合的气味。\n' +
            '墙上贴着发黄的广告画——\n' +
            '大力丸、阴丹士林、哈德门香烟。\n\n' +
            '七楼。最里面的门。',
      options: [
        { label: '敲门', next: 'intro2', affinity: 0 },
        { label: '站在门口犹豫', next: 'intro2', affinity: 0 },
      ],
    },
    intro2: {
      speaker: '叙述',
      text: '门开了。\n\n' +
            '她站在门口。还是那身黑色风衣，但帽子摘了。\n' +
            '穿着一件男式白衬衫，太大了，领口有墨渍。\n\n' +
            '她的头发是湿的——\n' +
            '外面没有下雨。\n\n' +
            '"你来了。"她侧身让你进门。',
      options: [
        { label: '……你的头发怎么是湿的？', next: 'intro2_q', affinity: 3 },
        { label: '你这里，一直这么暗吗？', next: 'intro2_q', affinity: 2 },
        { label: '直接走进去', next: 'intro2_enter', affinity: 1 },
      ],
    },
    intro2_q: {
      speaker: '她',
      text: '她摸了摸头发，像是才发现。\n\n' +
            '"哦。这个啊。我怕热。\n' +
            '你知道的，我不喜欢阳光。"',
      options: [
        { label: '……你是鬼吗？', next: 'intro2_ask_ghost', affinity: -5 },
        { label: '进来再说吧。', next: 'intro2_enter', affinity: 2 },
      ],
    },
    intro2_ask_ghost: {
      speaker: '她',
      text: '她笑了一下。笑得你后背发凉。\n\n' +
            '"你觉得呢？\n' +
            '你觉得我是鬼？\n' +
            '那你为什么还来？"',
      options: [
        { label: '……我不知道。', next: 'intro2_enter', affinity: 5 },
        { label: '因为名片上写了"收留"。', next: 'intro2_enter', affinity: 8 },
      ],
    },
    intro2_enter: {
      bg: 'old_apartment_night.jpg',
      speaker: '叙述',
      text: '房间比你想象的要大。\n' +
            '老式壁炉里的火是假的，但烟囱里冒着冷气。\n' +
            '窗帘拉得很紧，只有一线月光从缝隙里透进来。\n\n' +
            '茶几上放着一套茶具。\n' +
            '茶汤是混浊的琥珀色，像旧照片。\n\n' +
            '她倒了茶，推到你面前。\n\n' +
            '"喝吧。雨前龙井。\n' +
            '是三十年前的人寄来的。"',
      options: [
        { label: '三十年前？', next: 'q1', affinity: 3 },
        { label: '你一个人住？', next: 'q1', affinity: 2 },
        { label: '这里一直是你一个人？', next: 'q1', affinity: 2 },
      ],
    },
    // ── 场景2：第一次深谈 ──
    q1: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '你想不想做个实验？',
      options: [
        { label: '什么实验？', next: 'q2', affinity: 6 },
        { label: '你为什么想做实验？', next: 'q2', affinity: 4 },
        { label: '我只是路过。', next: 'q2_refuse', affinity: -8 },
      ],
    },
    q2_refuse: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '路过深夜的斜土路？\n' +
            '你若真是路过，就不是路过。',
      options: [
        { label: '……那是什么？', next: 'q2', affinity: 4 },
      ],
    },
    q2: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '墙上有一只停摆的钟。\n' +
            '我等你，让它再走起来。',
      triggerPuzzle: true,
    },
    after_puzzle: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '你选对了顺序。\n' +
            '——清晨，黄昏，深夜。\n' +
            '但其实，每个人的时间都是倒着走的。\n\n' +
            '我们先认识了深夜，\n' +
            '然后才学会了清晨。',
      options: [
        { label: '我不懂。', next: 'after_puzzle2', affinity: 0 },
        { label: '你是说……？', next: 'after_puzzle2', affinity: 5 },
      ],
    },
    after_puzzle2: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '她走向窗边，拉开一角窗帘。\n' +
            '月光照进来，落在她的脸上。\n\n' +
            '"你知道这栋楼有多少年了吗？"\n\n' +
            '"久到霞飞路换了三次名字。\n' +
            '久到这栋楼从三层变成了七层。\n' +
            '久到……"\n\n' +
            '她顿了顿。\n\n' +
            '"久到我还在这里。"',
      options: [
        { label: '你到底……是什么人？', next: 'meeting1', affinity: 8 },
        { label: '……我好像明白了。', next: 'meeting1', affinity: 5 },
      ],
    },
    meeting1: {
      speaker: '叙述',
      text: '【第一次见面结束】\n' +
            '你离开她家。街上开始下雨。\n\n' +
            '但这次，你不觉得冷了。\n' +
            '你摸了摸口袋里那张名片——\n' +
            '温热的，像有人刚刚握过。',
      options: [
        { label: '继续', next: 'meeting2', affinity: 0 },
      ],
    },
    // ── 场景3：第二、三次见面（作业） ──
    meeting2: {
      bg: 'old_apartment_night.jpg',
      speaker: '叙述',
      text: '【一周后】\n' +
            '你又去了斜土路。这次，你没有犹豫。\n\n' +
            '她给你倒了茶。茶几上多了一张黑胶唱片。\n' +
            '她放上去，转速不对——慢得像在水底。\n\n' +
            '是《月光奏鸣曲》。',
      options: [
        { label: '继续', next: 'meeting2_task', affinity: 0 },
      ],
    },
    meeting2_task: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '今天的作业：\n' +
            '在一家咖啡店坐一下午，\n' +
            '只看不点。\n' +
            '然后看营业员会不会赶你。',
      options: [
        { label: '我做了。没人赶我。', next: 'meeting2_result', affinity: 6 },
        { label: '我做了。有人赶我。', next: 'meeting2_result', affinity: 3 },
        { label: '我没做。', next: 'meeting2_result', affinity: -4 },
      ],
    },
    meeting2_result: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '她听着你说完，点了点头。\n\n' +
            '"赶你的那个人，\n' +
            '后来有没有跟你道歉？"',
      options: [
        { label: '……你怎么知道他会道歉？', next: 'meeting3', affinity: 5 },
        { label: '你怎么知道是他赶我？', next: 'meeting3', affinity: 5 },
        { label: '没有。但他看了我很久。', next: 'meeting3', affinity: 3 },
      ],
    },
    meeting3: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '她站起来，换了一张唱片。这次是正常的转速。\n\n' +
            '"今天的作业：\n' +
            '把手机关掉 24 小时。\n' +
            '看看谁会找你。\n' +
            '——以及，谁不会。"',
      options: [
        { label: '我做了。没人找我。', next: 'meeting4', affinity: 8 },
        { label: '我做了。只有我妈找我。', next: 'meeting4', affinity: 5 },
        { label: '我没做。我怕错过什么。', next: 'meeting4', affinity: -3 },
      ],
    },
    meeting4: {
      bg: 'old_apartment_night.jpg',
      speaker: '她',
      text: '她听着，笑了。\n\n' +
            '"没人找你是好事。\n' +
            '说明你终于有了一个晚上，\n' +
            '只属于你自己。"\n\n' +
            '她走到窗边。雨停了。月光很亮。\n\n' +
            '"今天的作业：\n' +
            '对明天的所有事，假装你不在乎。\n' +
            '——但不要假装爱。这是两件事。"',
      options: [
        { label: '……那「不假装爱」，有多难？', next: 'final_q', affinity: 10, marks: 'a' },
        { label: '……谢谢你，今晚。', next: 'final_q', affinity: 5, marks: 'b' },
        { label: '你也要假装不在乎吗？', next: 'final_q', affinity: 0, marks: 'c' },
      ],
    },
    final_q: {
      speaker: '她',
      text: '她回过头，看着你。\n\n' +
            '"做鬼好，还是做人好？\n' +
            '这个问题，我问过很多人。\n' +
            '有人说鬼好，因为鬼不用上班。\n' +
            '有人说鬼好，因为鬼不用交税。\n' +
            '但没有人说——鬼好在哪儿。"',
      options: [
        { label: '那你觉得呢？', next: 'rain_walk', affinity: 8 },
        { label: '……你是鬼吗？', next: 'rain_walk', affinity: 6 },
      ],
    },
    // ── 雨夜漫步 ──
    rain_walk: {
      bg: 'city_night.jpg',
      speaker: '叙述',
      text: '她没有回答。只是推开门，走出去。\n\n' +
            '"走吧。我带你走走。"\n\n' +
            '外面已经不下雨了。但地上还是湿的。\n' +
            '月光照下来，像铺了一层霜。\n\n' +
            '她走在你前面。身影修长，影子拖得很远。',
      options: [
        { label: '继续', next: 'rain_walk2', affinity: 0 },
      ],
    },
    rain_walk2: {
      bg: 'city_night.jpg',
      speaker: '叙述',
      text: '马路上没有一个人。\n' +
            '月色非常凄艳。\n' +
            '路灯更显得昏黑。\n' +
            '一点风也没有。\n\n' +
            '全世界静得——\n' +
            '只有我们两个人的脚步声。',
      options: [
        { label: '继续', next: 'rain_walk3', affinity: 0 },
      ],
    },
    rain_walk3: {
      bg: 'city_night.jpg',
      speaker: '她',
      text: '她突然开口：\n\n' +
            '"你刚才问我是不是鬼。"\n\n' +
            '"我不是神，可是我是鬼。"\n\n' +
            '她的脸冷艳得像久埋在冰山中心的白玉。\n\n' +
            '"但鬼也有鬼的规矩。\n' +
            '——鬼不能爱人。\n' +
            '爱了，就会变。变了，就会散。"',
      options: [
        { label: '……你在警告我？', next: 'rain_walk4', affinity: 5 },
        { label: '我不怕。', next: 'rain_walk4', affinity: 8 },
      ],
    },
    rain_walk4: {
      bg: 'rain_walk4.jpg',
      noCharacter: true,
      speaker: '她',
      text: '她笑了。\n' +
            '这是你第一次听到她笑。\n\n' +
            '那笑声——\n' +
            '似乎极富有展延声似的。\n' +
            '从笑完起，这声音悠悠的高起来。\n' +
            '似乎从人世升上天去。\n\n' +
            '你望望天空。\n' +
            '天空上有皎好的月，稀疏的星点。\n' +
            '还有幽幽西流的天河。',
      options: [
        { label: '继续', next: 'rain_walk5', affinity: 0 },
      ],
    },
    rain_walk5: {
      bg: 'city_night.jpg',
      noCharacter: true,
      speaker: '她',
      text: '她停下脚步。你也停下。\n\n' +
            '"你知道人为什么怕鬼吗？"\n' +
            '你摇头。\n\n' +
            '"因为鬼还记得太多。\n' +
            '我记得这条街上所有的店铺。\n' +
            '我记得每个路过的人的脸。\n' +
            '我记得……"\n\n' +
            '她顿了顿。\n\n' +
            '"很久以前，也有一个像你一样的人。"',
      options: [
        { label: '……后来呢？', next: 'rain_walk6', affinity: 8 },
        { label: '他怎么了？', next: 'rain_walk6', affinity: 8 },
      ],
    },
    rain_walk6: {
      bg: 'city_night.jpg',
      speaker: '叙述',
      text: '她没有回答。只是继续往前走。\n\n' +
            '你跟上去。\n' +
            '她突然伸出手——\n' +
            '冰凉的指尖触碰到你的手背。\n\n' +
            '你没有缩回来。\n\n' +
            '"一个月后。\n' +
            '我们教堂见。"',
      options: [
        { label: '……好。', next: 'CH4', affinity: 5 },
      ],
    },
    CH4: {
      speaker: '叙述',
      text: '【一个月后】\n' +
            '她消失了。\n' +
            '斜土路的公寓空了。邻居说，从没见过她。\n\n' +
            '你找了很多地方。\n' +
            '最后，你想起了她最后那句话——\n\n' +
            '"教堂见。"',
      options: [
        { label: '继续', next: 'CLIMAX', final: true, affinity: 0 },
      ],
    },
  };

  function initChapter2() {
    gameState.chapter = 3;
    updateProgress();

    switchScene('scene-chapter2');

    const stage = document.getElementById('ch2-character');
    stage.classList.add('silhouette');

    renderDialogue('ch2', chapter2Dialogue.intro);
  }

  function initClockPuzzle() {
    return new Promise((resolve) => {
      const puzzle = document.getElementById('clock-puzzle');
      const status = document.getElementById('puzzle-status');
      const photos = document.querySelectorAll('.photo-btn');
      const expected = ['morning', 'dusk', 'midnight'];
      let clicks = [];

      puzzle.hidden = false;

      photos.forEach((photo) => {
        photo.onclick = () => {
          const photoName = photo.dataset.photo;
          if (clicks.includes(photoName)) return;
          clicks.push(photoName);
          photo.classList.add('selected');

          if (clicks.length === 3) {
            const correct = clicks.every((c, i) => c === expected[i]);
            if (correct) {
              status.textContent = '✓ 钟声响起';
              status.classList.add('success');
              gameState.puzzleSolved = true;
              setTimeout(() => {
                puzzle.hidden = true;
                resolve();
              }, 1200);
            } else {
              status.textContent = '顺序不对，再想想。';
              setTimeout(() => {
                clicks = [];
                photos.forEach((p) => p.classList.remove('selected'));
                status.textContent = '';
              }, 1500);
            }
          }
        };
      });

      // 提供跳过选项（隐藏结局触发条件之一）
      const skipBtn = document.createElement('button');
      skipBtn.className = 'option-btn';
      skipBtn.textContent = '· 跳过谜题';
      skipBtn.style.marginTop = '16px';
      skipBtn.onclick = () => {
        gameState.noPuzzleFlags++;
        gameState.secretPath = true;
        skipBtn.remove();
        status.textContent = '（你绕过了钟）';
        setTimeout(() => {
          puzzle.hidden = true;
          resolve();
        }, 1000);
      };
      puzzle.appendChild(skipBtn);
    });
  }

  // ============================================
  // 高潮：教堂之夜（人鬼虐恋真相揭示线）
  // ============================================
  const climaxDialogue = {
    intro: {
      speaker: '叙述',
      text: '教堂在夜色里像一座坟。\n\n' +
            '彩色玻璃窗在月光下像一只只死掉的眼睛。\n' +
            '钟楼上的指针停在了三点一刻。\n\n' +
            '她站在门口。\n' +
            '还是那件黑色风衣，但这次，她没有戴帽子。\n\n' +
            '月光照在她的脸上——\n' +
            '那张脸，突然变得很老，又突然变得很年轻，\n' +
            '像一张被反复翻拍的照片。',
      options: [
        { label: '继续', next: 'q1', affinity: 0 },
      ],
    },
    q1: {
      speaker: '她',
      text: '我带你来看个东西。',
      options: [
        { label: '……什么东西？', next: 'q1_2', affinity: 0 },
        { label: '你消失了一个月，就是在这里？', next: 'q1_2', affinity: 3 },
      ],
    },
    q1_2: {
      speaker: '她',
      text: '她指着教堂的尖顶。\n\n' +
            '"你看那个十字架。\n' +
            '它钉在那儿多少年了？"\n\n' +
            '"……一百年？两百年？"\n\n' +
            '她摇头。\n\n' +
            '"从它立起来的那一天起，\n' +
            '我就看着它了。\n' +
            '记得这里还是一片泥地的时候，\n' +
            '有个传教士在这里跪着祈祷。"\n\n' +
            '"他跪了三天三夜。\n' +
            '然后——死了。"',
      options: [
        { label: '……所以你到底是——', next: 'q1_3', affinity: 0 },
      ],
    },
    q1_3: {
      speaker: '她',
      text: '她打断你，声音突然变得很远。\n\n' +
            '"别问。\n' +
            '问了，就没意思了。"\n\n' +
            '她转过身，看着你。\n\n' +
            '"你为什么来找我？"',
      options: [
        { label: '我想知道真相。', next: 'q2_truth', affinity: 5 },
        { label: '我想再见到你。', next: 'q2_love', affinity: 8 },
        { label: '我只是想确认你是鬼。', next: 'q2_ghost', affinity: -5 },
      ],
    },
    q2_truth: {
      speaker: '她',
      text: '真相？\n\n' +
            '"你想知道的是哪种真相？\n' +
            '社会学意义上的？\n' +
            '还是——"\n\n' +
            '她牵住你的手。\n' +
            '冰凉的。\n' +
            '但这次，你没有缩回来。',
      marks: 'truth',
      options: [
        { label: '……两种我都要。', next: 'truth_reveal', affinity: 8 },
      ],
    },
    truth_reveal: {
      speaker: '她',
      text: '她看着你，眼神里有一种古老的疲倦。\n\n' +
            '"你知道人为什么怕鬼吗？"\n\n' +
            '"……怕死？"\n\n' +
            '"不是。\n' +
            '是怕鬼还记得太多。"\n\n' +
            '"我记得这条街上一百年前的样子。\n' +
            '那时候没有霓虹灯，只有煤油灯。\n' +
            '我记得每一个在这条街上走过的人的脸。"',
      showFace: true,
      options: [
        { label: '……你是认真的？', next: 'truth_reveal2', affinity: 5 },
        { label: '那你为什么要告诉我？', next: 'truth_reveal2', affinity: 8 },
      ],
    },
    truth_reveal2: {
      speaker: '她',
      text: '她松开你的手，退后一步。\n\n' +
            '"我记得你。"\n\n' +
            '你心跳漏了一拍。\n\n' +
            '"……你认识我？"\n\n' +
            '"不是你。\n' +
            '但你的影子，像一个人。\n' +
            '他也是这样——\n' +
            '在深夜走进我的店，买一包烟，\n' +
            '在深夜走进我的店，买一包烟，\n' +
            '然后问我："你到底是什么？"\n\n' +
            '她突然笑了，笑得很轻。\n\n' +
            '"然后他就没有再来过。"',
      options: [
        { label: '他后来怎么了？', next: 'truth_reveal3', affinity: 10 },
      ],
    },
    truth_reveal3: {
      noCharacter: true,
      speaker: '她',
      text: '她没有立刻回答。\n' +
            '而是转身，走向教堂的门。\n\n' +
            '"他后来回来了。"\n\n' +
            '你跟上去。\n\n' +
            '"带着一束花。\n' +
            '说——他想通了。\n' +
            '他要留下来。"\n\n' +
            '她推开教堂的门。\n\n' +
            '"他在这里住了一年。\n' +
            '一年后的冬天——\n' +
            '他死了。"',
      options: [
        { label: '……怎么死的？', next: 'truth_reveal4', affinity: 5 },
      ],
    },
    truth_reveal4: {
      bg: 'warm amber glow.jpg',
      noCharacter: true,
      speaker: '她',
      text: '她的声音很轻。\n' +
            '轻得像月光落在石板上。\n\n' +
            '"他是活活冻死的。\n' +
            '因为他非要开着窗睡觉。"\n\n' +
            '你沉默。\n\n' +
            '"他说——\n' +
            '"我想感受你感受过的冷。"\n\n' +
            '她回过头，看着你。\n' +
            '月光照在她脸上，你第一次看清她的眼睛——\n' +
            '那双眼睛里没有泪水。\n' +
            '只有一种很深很深的东西。\n' +
            '像一口井。',
      options: [
        { label: '……你爱他吗？', next: 'truth_reveal5', affinity: 10 },
      ],
    },
    truth_reveal5: {
      bg: 'warm amber glow.jpg',
      noCharacter: true,
      speaker: '她',
      text: '她没有回答。\n' +
            '沉默了很久。\n\n' +
            '"我不知道什么是爱。\n' +
            '我只知道——\n' +
            '他走了以后，\n' +
            '我等了很久。\n\n' +
            '久到我开始忘记他的脸。"\n\n' +
            '她转过身，看着你。\n\n' +
            '"直到你出现。"\n\n' +
            '"你的脚步声和他一样。\n' +
            '你点烟的样子也和他一样。\n' +
            '但你的眼睛不一样。"',
      options: [
        { label: '……怎么不一样？', next: 'truth_reveal6', affinity: 8 },
      ],
    },
    truth_reveal6: {
      bg: 'warm amber glow.jpg',
      noCharacter: true,
      speaker: '她',
      text: '她伸手，触碰你的脸。\n' +
            '指尖冰凉。\n\n' +
            '"他的眼睛里只有恐惧和渴望。\n' +
            '你的眼睛里——"\n\n' +
            '她顿了顿。\n\n' +
            '"——有一种我不想辜负的东西。"\n\n' +
            '她的手从你脸上滑落。\n\n' +
            '"所以我消失了。\n' +
            '我想看看——\n' +
            '你会不会来找我。\n' +
            '像他一样。\n' +
            '还是会像其他人一样，\n' +
            '把我忘掉。"',
      options: [
        { label: '我来了。', next: 'truth_final_choice', affinity: 10 },
        { label: '……所以你到底是什么？', next: 'truth_final_choice', affinity: 5 },
      ],
    },
    truth_final_choice: {
      noCharacter: true,
      speaker: '她',
      text: '她笑了。\n' +
            '这次的笑，和之前所有的笑都不一样。\n\n' +
            '"现在，轮到你了。\n' +
            '你想成为什么？"',
      options: [
        { label: '回到"人"的世界。', next: 'END_A', affinity: -5 },
        { label: '和你一起。', next: 'END_B', affinity: 10 },
        { label: '做彼此的黄昏。', next: 'END_C', affinity: 8, lockedBy: 60 },
      ],
    },
    // ── 爱意线 ──
    q2_love: {
      speaker: '她',
      text: '……那你听好。',
      showFace: true,
      options: [
        { label: '……', next: 'truth_reveal', affinity: 8 },
      ],
    },
    // ── 确认鬼身份线 ──
    q2_ghost: {
      speaker: '她',
      text: '她没有笑。\n\n' +
            '"是。\n' +
            '但你以为，这会让你更怕吗？\n' +
            '还是——"\n\n' +
            '她走近一步。\n\n' +
            '"还是会让你更想留下来？"',
      options: [
        { label: '……我不知道。', next: 'truth_reveal', affinity: 5 },
        { label: '我不会走。', next: 'truth_reveal', affinity: 10 },
      ],
    },
    // ── 旧版 q3 保留（过渡用） ──
    q3_love: {
      speaker: '她',
      text: '我曾经是个"人"。\n' +
            '有家庭，有工作，有朋友。\n' +
            '后来一个一个都消失了。\n' +
            '不是我离开他们，是他们离开我。\n' +
            '——所以我决定，离开所有人。',
      options: [
        { label: '那你为什么还让我进来？', next: 'truth_reveal', affinity: 8 },
      ],
    },
    q3: {
      speaker: '她',
      text: '我对你做的那些作业，\n' +
            '咖啡、手机、假装不在乎。\n' +
            '不是教你做鬼。\n' +
            '是教你——\n' +
            '在做人很累的时候，给自己留一扇门。',
      options: [
        { label: '我懂了。', next: 'truth_final_choice', affinity: 5 },
      ],
    },
    // ── 三个结局 ──
    END_A: {
      noCharacter: true,
      speaker: '她',
      text: '……你还是要回去。\n\n' +
            '她退后一步。\n\n' +
            '"也好。\n' +
            '人还是要回去的。\n' +
            '鬼不会怪你。\n' +
            '但鬼会记得你。\n' +
            '很久，很久。"\n\n' +
            '她转身，走向教堂深处。\n' +
            '月光照在她的背影上，越来越淡。',
      options: [
        { label: '继续', next: 'ENDING_A', final: true },
      ],
    },
    END_B: {
      noCharacter: true,
      speaker: '她',
      text: '她看着你。\n\n' +
            '"你知道这意味着什么吗？"\n\n' +
            '"知道。"\n\n' +
            '她伸出手。\n' +
            '这次，你主动握住了。\n\n' +
            '冰凉的。\n' +
            '但你不再想松开。',
      options: [
        { label: '继续', next: 'ENDING_B', final: true },
      ],
    },
    END_C: {
      noCharacter: true,
      speaker: '她',
      text: '她沉默了很久。\n\n' +
            '"黄昏？"\n\n' +
            '"对。黄昏。\n' +
            '不是鬼，不是人。\n' +
            '是白天和黑夜的交界。"\n\n' +
            '她笑了。\n\n' +
            '"我等了一百年，\n' +
            '就是等一个说这种话的人。"',
      options: [
        { label: '继续', next: 'ENDING_C', final: true },
      ],
    },
  };

  function initClimax() {
    gameState.chapter = 4;
    updateProgress();

    switchScene('scene-climax');

    const stage = document.getElementById('climax-character');
    gameState.choseTruth = false;

    renderDialogue('climax', climaxDialogue.intro);
  }

  function triggerEnding(choiceId) {
    let endingId;

    // 隐藏结局触发条件：cardChoice === 'leave' && noPuzzleFlags > 0
    if (gameState.cardChoice === 'leave' && gameState.noPuzzleFlags > 0 && choiceId === 'ENDING_B') {
      endingId = 'h';
    } else if (choiceId === 'ENDING_A') {
      endingId = 'a';
    } else if (choiceId === 'ENDING_B') {
      endingId = 'b';
    } else if (choiceId === 'ENDING_C') {
      endingId = 'c';
    }

    recordEnding(endingId);
    gameState.ending = endingId;

    switchScene(`scene-ending-${endingId}`);

    setTimeout(() => {
      showEndingText(endingId);
    }, 1200);
  }

  function showEndingText(id) {
    const texts = {
      a: '你走出教堂。天亮了。\n\n' +
         '阳光照在脸上，有些刺眼。\n' +
         '但你不再觉得冷了。\n\n' +
         '你摸了摸口袋——名片还在。\n' +
         '字迹已经完全模糊，\n' +
         '只剩下一个淡淡的轮廓。\n\n' +
         '也许从一开始，\n' +
         '她就知道你会走这条路。\n\n' +
         '人，总是要回去的。\n\n' +
         '你回到家，打开电脑。\n' +
         '开始写那本一直没写完的小说。\n\n' +
         '这一次，你没有把它改成"正能量"。\n\n' +
         '开头第一句是：\n\n' +
         '"我在便利店遇见了一个鬼。\n' +
         '她教会我——\n' +
         '如何在人世间，保持鬼的清醒。"',

      b: '你穿上她的那件黑色风衣。\n' +
         '太大了。但很暖。\n\n' +
         '手机被你关掉了。\n' +
         '通讯录一个一个被删掉。\n' +
         '——他们都已经是过去了。\n\n' +
         '你走出家门。\n' +
         '外面在下雨。\n' +
         '你没有带伞。\n\n' +
         '她站在街角等你。\n' +
         '看见你，笑了一下。\n\n' +
         '那笑声——\n' +
         '从人世升上天去，\n' +
         '登上了云端。\n\n' +
         '从今天起，世界上多了两个"鬼"。\n' +
         '她走在你的左边。\n\n' +
         '你们像两个影子，消失在雨夜。\n\n' +
         '——很久以后，\n' +
         '有人在这座城市的雨夜里，\n' +
         '看到一个穿黑色风衣的男人，\n' +
         '和一个戴宽檐帽的女人。\n' +
         '他们在便利店里买烟。\n' +
         '收银员说——\n' +
         '"他们好像是鬼。"',

      c: '雨终于停了。\n\n' +
         '她站在教堂的窗前，摘下帽子。\n\n' +
         '你第一次看清她的脸。\n\n' +
         '不是冷艳的白玉，\n' +
         '而是一个普通女人的脸。\n' +
         '有些苍白，有些疲惫。\n' +
         '但眼睛里——\n' +
         '终于有了光。\n\n' +
         '"人"和"鬼"，\n' +
         '是同一个人的白天与夜晚。\n\n' +
         '"那我们就是——"\n\n' +
         '"——做彼此的黄昏。"\n\n' +
         '从此以后，你们轮流做对方的"人"与"鬼"。\n' +
         '白天，她是那个疲惫的普通人。\n' +
         '夜晚，你成了那个清醒的"鬼"。\n\n' +
         '但无论白天还是黑夜——\n' +
         '你们都在同一座城市的雨夜里。\n' +
         '等待着彼此。\n' +
         '在便利店里。\n' +
         '在斜土路的老公寓里。\n' +
         '在教堂的月光下。\n\n' +
         '人约黄昏。\n' +
         '不是黄昏的约定。\n' +
         '而是——\n' +
         '你和她的故事，\n' +
         '刚刚开始。',

      h: '你睁开了眼。\n\n' +
         '你躺在便利店的地上。\n' +
         '凌晨三点。\n' +
         '收银员在叫你的名字。\n\n' +
         '"先生？先生？\n' +
         '您没事吧？\n' +
         '您刚才好像睡着了。"\n\n' +
         '你坐起来。\n' +
         '浑身酸痛。\n' +
         '像是做了一个很长很长的梦。\n\n' +
         '——黑衣女子？\n' +
         '从来就没有。\n' +
         '所有的对话，\n' +
         '都是你自己心里的声音。\n\n' +
         '也许是咖啡喝多了。\n' +
         '也许是和编辑吵架吵得太累。\n' +
         '也许——\n' +
         '你只是想逃避。\n\n' +
         '也许这个世界上，从来没有"鬼"。\n' +
         '只有不愿做"人"的自己。\n\n' +
         '但奇怪的是——\n' +
         '你口袋里有一张名片。\n' +
         '黑色的，宣纸质地的。\n' +
         '上面只有几个字：\n\n' +
         '"深夜无聊的人，我都收留。"\n\n' +
         '你笑了。\n' +
         '把名片收好。\n' +
         '推开门，走进雨里。\n\n' +
         '也许——\n' +
         '不是梦呢？',
    };

    const textEl = document.getElementById(`ending-${id}-text`);
    typeText(textEl, texts[id], 30);

    // 显示片尾进度（文本变长，延长等待时间到15秒）
    setTimeout(() => {
      switchScene('scene-credits');
      showCredits();
    }, 15000);
  }

  function showCredits() {
    const total = 4;
    const unlocked = gameState.unlockedEndings.size;
    const el = document.getElementById('credits-unlocks');
    el.textContent = `已解锁结局 ${unlocked} / ${total}`;
  }

  // ============================================
  // 进度点
  // ============================================
  function updateProgress() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    const steps = ['cover', 'ch1', 'ch2', 'climax'];
    const currentStep = steps[gameState.chapter] || 'cover';

    dots.forEach((dot) => {
      const step = dot.dataset.step;
      const stepIdx = steps.indexOf(step);
      const currentIdx = steps.indexOf(currentStep);
      dot.classList.remove('active', 'passed');
      if (step === currentStep) {
        dot.classList.add('active');
      } else if (stepIdx < currentIdx) {
        dot.classList.add('passed');
      }
    });
  }

  // ============================================
  // 场景切换包裹（处理谜题触发）
  // ============================================
  const originalRenderDialogue = renderDialogue;

  // 给第二张对话树加入谜题触发点
  function patchedChapter2Flow(node) {
    if (node.triggerPuzzle) {
      // 显示文本 + 触发谜题
      const textEl = document.getElementById('dialogue-text-ch2');
      const optionsEl = document.getElementById('option-list-ch2');
      const speakerEl = document.getElementById('speaker-name-ch2');
      const continueBtn = document.getElementById('dialogue-continue-ch2');

      speakerEl.textContent = node.speaker;
      optionsEl.innerHTML = '';
      continueBtn.hidden = true;

      typeText(textEl, node.text).then(() => {
        initClockPuzzle().then(() => {
          renderDialogue('ch2', chapter2Dialogue.after_puzzle);
        });
      });
      return;
    }
    originalRenderDialogue('ch2', node);
  }

  // 替换第二章渲染
  window.__patchedRender = patchedChapter2Flow;

  // ============================================
  // 事件绑定
  // ============================================
  function bindEvents() {
    // 封面开始
    document.querySelector('.start-btn').addEventListener('click', startGame);

    // 开场继续
    document.querySelector('.opening-continue').addEventListener('click', openingContinue);

    // 静音按钮
    document.getElementById('mute-btn').addEventListener('click', toggleMute);

    // 回到封面
    document.querySelectorAll('[data-action="back-to-title"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        gameState.chapter = 0;
        updateProgress();
        switchScene('scene-cover');
      });
    });

    // 再读一遍
    document.querySelector('[data-action="restart"]').addEventListener('click', () => {
      // 重置状态但保留解锁
      gameState.affinity = 0;
      gameState.cardChoice = null;
      gameState.puzzleSolved = false;
      gameState.choseTruth = false;
      gameState.ending = null;
      gameState.choiceHistory = [];
      gameState.secretPath = false;
      gameState.noPuzzleFlags = 0;
      gameState.chapter = 0;
      updateProgress();
      switchScene('scene-cover');
    });
  }

  // ============================================
  // 启动
  // ============================================
  function init() {
    loadProgress();
    bindEvents();
    updateProgress();

    // 背景图预加载：图片加载完成后追加 .has-image 触发真实图片显示
    const bgAssets = [
      'assets/cover.jpg',
      'assets/convenience_store.jpg',
      'assets/convenience_store_night.jpg',
      'assets/old_apartment.jpg',
      'assets/old_apartment_night.jpg',
      'assets/city_night.jpg',
      'assets/rain_walk4.jpg',
      'assets/warm amber glow.jpg',
      'assets/cathedral.jpg',
      'assets/ending_a.jpg',
      'assets/ending_b.jpg',
      'assets/ending_c.jpg',
    ];
    bgAssets.forEach(src => {
      const img = new Image();
      img.onload = () => {
        const cls =
          src === 'assets/cover.jpg' ? 'bg-cover'
          : src === 'assets/convenience_store.jpg' ? 'bg-convenience-store'
          : src === 'assets/old_apartment.jpg' ? 'bg-old-apartment'
          : src === 'assets/city_night.jpg' ? 'bg-city-night'
          : src === 'assets/cathedral.jpg' ? 'bg-cathedral'
          : src === 'assets/ending_a.jpg' ? 'bg-ending-a'
          : src === 'assets/ending_b.jpg' ? 'bg-ending-b'
          : src === 'assets/ending_c.jpg' ? 'bg-ending-c'
          : '';
        const el = document.querySelector('.' + cls);
        if (el) el.classList.add('has-image');
      };
      img.onerror = () => { /* 图片不存在，静默忽略 */ };
      img.src = src;
    });

    // 第二章渲染劫持：处理谜题触发
    // 简单实现：监听文本里包含 "墙上有一只停摆的钟" 时启动谜题
    const observer = new MutationObserver(() => {
      const textEl = document.getElementById('dialogue-text-ch2');
      if (textEl && textEl.textContent.includes('墙上有一只停摆的钟')) {
        observer.disconnect();
        setTimeout(() => {
          initClockPuzzle().then(() => {
            renderDialogue('ch2', chapter2Dialogue.after_puzzle);
          });
        }, 1500);
      }
    });

    // 监听对话区 DOM 变化
    const ch2Dialogue = document.getElementById('dialogue-box-ch2');
    if (ch2Dialogue) {
      observer.observe(ch2Dialogue, { childList: true, subtree: true, characterData: true });
    }
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露给控制台调试
  window.__game = { gameState, switchScene, triggerEnding };
})();
