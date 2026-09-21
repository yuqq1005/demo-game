(() => {
  const STORAGE = {
    cleared: "voss_library_cleared",
    trueEnding: "voss_library_true",
  };

  const ITEMS = {
    smallkey: { id: "smallkey", name: "小钥匙", img: "prop_small_key.png", tip: "一枚发暗的小钥匙。" },
    key: { id: "key", name: "黄铜蜡封钥匙", img: "prop_key.png", tip: "封着家族蜡印的钥匙。" },
    card: { id: "card", name: "伊洛恩的借阅卡", img: "prop_card.png", tip: "姓名在褪。索书号还在：B-17。" },
    note: { id: "note", name: "批注残页", img: "prop_note.png", tip: "夹在《图书馆管理学》里的手写残页。" },
    flower: { id: "flower", name: "野榆干花书签", img: "prop_flower.png", tip: "她生前喜爱的花。" },
  };

  const SECRETS = {
    memo: {
      id: "memo",
      title: "馆长手写便签",
      img: "prop_memo.png",
      body:
        "字迹微微发抖：\n\nDo not read the final page.\n不要阅读最后一页。\n\n他怕你把她读回来；也怕你看见他的罪。祖训只教「别写活人」，没教写错了怎么拆。",
    },
    cards: {
      id: "cards",
      title: "手写借阅卡（两张）",
      img: "prop_card.png",
      body:
        "伊洛恩·沃斯：借阅停在失踪当日，姓名正在褪色。索书号栏写着 B-17。旁注：待删除。\n\n沃斯夫人：姓名栏空白。配偶栏只有 Voss。\n老馆员只记得：馆长曾经有过一位夫人。",
    },
    ink: {
      id: "ink",
      title: "干涸墨水瓶",
      img: "prop_ink.png",
      body:
        "鹅毛笔斜靠在瓶侧。瓶口的墨早已干裂成黑痂。\n\n《未编目之书》本应收藏残响。有人用它写下活人的名字，把「待删除」冻成「暂存」。",
    },
    photo: {
      id: "photo",
      title: "撕裂的银盐旧相纸",
      img: "prop_photo.png",
      body:
        "女人的面部被撕掉了。只剩裙角一角。\n\n已抹除：删除走完，连残响都没进空白书。没有名字可召回。",
    },
  };

  const BOOK_REVEALS = {
    key: "地下入口是那场违训仪式留下的。\n\n祖训写得很死：活人，不准主动写进《未编目之书》。\n写进去的人出不来。在这座馆里，进了目录，才算还在。\n\n他把钥匙蜡封起来，等于把出口也藏进了自己不敢再碰的地方。",
    note: "她去查母亲，翻了禁区里改条目的书。编目开始清她：同事对不上她的脸，借阅卡上的名字一天淡似一天。\n\n父亲用干墨写下「伊洛恩·沃斯」，写进那本空白古书。他以为这样能把她从「待删除」挪到「暂存」。\n活人不该被写成条目。她被冻在书里了。",
    flower: "野榆是她生前最爱的花。仪式里钉在书脊上，用来钉住「她是谁」。\n\n他以为自己在救我。\n可我只是……再也走不出去。",
  };

  const MONOLOGUE = [
    "十年了。外面的人只记得馆长的女儿失踪了。他们不记得我的脸，也不记得我的名字该怎么念。",
    "我是伊洛恩·沃斯。夜班助手。巡灯，还书，核对手写卡片。不该变成书页里的人。",
    "母亲差不多从馆史里被抹干净了。卡片上只剩配偶栏的 Voss。老馆员说：馆长曾经有过一位夫人。别的，没有。",
    "她早年整理禁区，误触了改条目的书。父亲怕祖训，不敢动空白古书。删除走完，连残响都没有。彻底的「已抹除」。",
    "我想把她读回来。我潜入禁区，去读那些能改写条目的书。读太深了。轮到我自己变成「待删除」。",
    "请假没用，药也没用。同事开始叫不出我的名字。借阅卡上的墨，像受了潮，一点点淡下去。",
    "父亲见过犹豫怎样毁一个人。这一次他选了另一头：干墨写下我的全名，写进《未编目之书》；野榆钉住书脊；蜡封钥匙锁死地下。",
    "他把「待删除」冻成「暂存」。删除令只是挂起，并没有取消。我没有同意。他用馆规替我选了活法。",
    "馆规写死了：写入者读不出自己写进去的人。他回看，只能看见自己的笔迹。出口只能交给外人。",
    "于是他把钥匙、残页、干花拆开，散在一楼，把这一夜交给你。便签上写着「不要阅读最后一页」。他怕，也不敢补救。",
    "最后一页不是毁掉什么。有人把真相看全了，条目才能改写，旧的删除令才会作废。母亲已经没有残响，召不回来。我还有。",
    "他以为自己在救我。可我只是……再也走不出去。今夜，请你读完。或者合上。",
  ];

  const INTRO = [
    { speaker: "值夜规程", text: "你是今夜的值夜人。\n\n巡一楼灯火，核还书车，手写借阅卡别乱，黎明前关好门窗。\n这座馆对外接待学者。对内只认编目：目录里有你，你才算还活着。", bg: "library_overview.png", curator: "off" },
    { speaker: "你", text: "雾气贴着橡木窗。煤油灯还没点齐。馆长约你在大厅见面，说有几句交代。", bg: "library_overview.png", curator: "off" },
    { speaker: "沃斯馆长", text: "……今夜由你值守。一楼的灯、抽屉、卡片盒，照旧巡一遍。\n我的女儿。外界只说她失踪了十年。你不必打听。馆里的人也不记得清楚。", bg: "floor1_hall.png", curator: "on" },
    { speaker: "沃斯馆长", text: "地下二层藏着一本书。它已经等了一百年。\n钥匙我拆开了。有些东西，不该再由我亲手碰。\n便签上的话，听或不听，随你。", bg: "floor1_hall.png", curator: "on" },
    { speaker: "旁白", text: "他戴上帽子，没有回头。大门在雾里合上。\n\n值夜开始。你可以先去值班桌点灯，也可以去阅览廊、还书廊转转。", bg: "floor1_hall.png", curator: "leaving" },
  ];

  const EXPLORE_SCENES = ["desk", "stacks", "lobby"];

  const state = {
    scene: "title",
    introIndex: 0,
    lampOn: false,
    inventory: [],
    placedB2: { key: false, note: false, flower: false },
    placedBook: { key: false, note: false, flower: false },
    secrets: { memo: false, cards: false, ink: false, photo: false },
    selectedItem: null,
    monoIndex: 0,
    bookReady: false,
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const BGM_SRC = "music/" + encodeURIComponent("Fabrizio Paterlini - Empty Room.mp3");
  const CLICK_SFX_SRC = "music/action.mp3";
  const BGM_VOLUME = 0.4;
  const CLICK_SFX_VOLUME = 0.18;
  let bgm = null;
  let bgmMuted = false;
  let clickSfx = null;

  function syncMusicBtn() {
    const btn = $("#btn-music");
    if (!btn) return;
    const muted = bgmMuted;
    btn.setAttribute("aria-pressed", muted ? "true" : "false");
    btn.title = muted ? "开启音乐" : "关闭音乐";
    btn.setAttribute("aria-label", muted ? "开启音乐" : "关闭音乐");
  }

  function playBgm() {
    if (!bgm) {
      bgm = new Audio(BGM_SRC);
      bgm.loop = true;
      bgm.volume = BGM_VOLUME;
    }
    if (bgmMuted) {
      syncMusicBtn();
      return;
    }
    const p = bgm.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    syncMusicBtn();
  }

  function toggleBgm() {
    bgmMuted = !bgmMuted;
    if (!bgm) {
      syncMusicBtn();
      return;
    }
    if (bgmMuted) bgm.pause();
    else {
      const p = bgm.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    syncMusicBtn();
  }

  function playClickSfx() {
    if (!clickSfx) {
      clickSfx = new Audio(CLICK_SFX_SRC);
      clickSfx.volume = CLICK_SFX_VOLUME;
      clickSfx.preload = "auto";
    }
    const shot = clickSfx.cloneNode();
    shot.volume = CLICK_SFX_VOLUME;
    const p = shot.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  function secretsFound() {
    return Object.values(state.secrets).filter(Boolean).length;
  }
  function hasAllTokens() {
    return ["key", "note", "flower"].every((id) => state.inventory.includes(id));
  }

  function toast(msg, ms = 2200) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, ms);
  }

  function setCaption(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
  }

  function imgUrl(file) {
    return "images/" + file;
  }

  function trySetBg(el, file) {
    if (!el || !file) return;
    const url = imgUrl(file);
    const img = new Image();
    img.onload = () => {
      el.style.setProperty("--bg", 'url("' + url + '")');
      el.classList.add("has-img");
    };
    img.onerror = () => console.warn("[library] missing image:", url);
    img.src = url;
  }

  function hydrateImages() {
    $$(".scene-bg[data-img], #blank-book[data-img], #silhouette[data-img], #intro-curator[data-img]").forEach((el) => {
      trySetBg(el, el.dataset.img);
    });
  }

  function showScene(name) {
    state.scene = name;
    $$(".scene").forEach((s) => s.classList.toggle("active", s.dataset.scene === name));
    const inv = $("#inventory");
    inv.hidden = !EXPLORE_SCENES.includes(name) && name !== "b2" && name !== "bookInner";
    renderInventory();
    updateDoor();
  }

  function renderInventory() {
    const box = $("#inv-items");
    box.innerHTML = "";
    state.inventory.forEach((id) => {
      const item = ITEMS[id];
      const used =
        (state.scene === "b2" && state.placedB2[id]) ||
        (state.scene === "bookInner" && state.placedBook[id]);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "inv-item" + (state.selectedItem === id ? " selected" : "") + (used ? " used" : "");
      btn.dataset.item = id;
      btn.innerHTML =
        '<span class="inv-thumb" style="background-image:url(\'' +
        imgUrl(item.img) +
        '\')"></span><span>' +
        item.name +
        "</span>";
      btn.addEventListener("click", () => {
        if (used) return;
        state.selectedItem = state.selectedItem === id ? null : id;
        renderInventory();
        toast(
          state.selectedItem
            ? id === "smallkey" || id === "card"
              ? "已选中：" + item.name + "。"
              : "已选中：" + item.name + "（点击插槽放入）"
            : "取消选择"
        );
      });
      btn.draggable = !used;
      btn.addEventListener("dragstart", (e) => {
        if (used) return;
        state.selectedItem = id;
        e.dataTransfer.setData("text/plain", id);
      });
      box.appendChild(btn);
    });
  }

  function closeArtZoom() {
    const zoom = $("#art-zoom");
    if (zoom) zoom.hidden = true;
  }

  function openArtZoom(imgFile) {
    if (!imgFile) return;
    const zoom = $("#art-zoom");
    const img = $("#art-zoom-img");
    if (!zoom || !img) return;
    img.style.backgroundImage = 'url("' + imgUrl(imgFile) + '")';
    zoom.hidden = false;
  }

  function openModal(opts) {
    const card = $("#modal-card");
    const art = $("#modal-art");
    const wrap = $("#modal-art-wrap");
    const kicker = $("#modal-kicker");
    $("#modal-title").textContent = opts.title;
    $("#modal-body").textContent = opts.body;
    if (card) {
      card.classList.toggle("is-reveal", !!opts.reveal);
      card.classList.toggle("has-art", !!opts.img);
    }
    if (kicker) {
      if (opts.kicker) {
        kicker.hidden = false;
        kicker.textContent = opts.kicker;
      } else {
        kicker.hidden = true;
        kicker.textContent = "";
      }
    }
    if (wrap && art) {
      if (opts.img) {
        wrap.hidden = false;
        art.style.backgroundImage = 'url("' + imgUrl(opts.img) + '")';
        art.onclick = () => openArtZoom(opts.img);
      } else {
        wrap.hidden = true;
        art.style.backgroundImage = "none";
        art.onclick = null;
      }
    }
    $("#modal").hidden = false;
    $("#modal-close").onclick = () => {
      closeArtZoom();
      $("#modal").hidden = true;
      if (opts.onClose) opts.onClose();
    };
  }

  function markSecret(id) {
    if (state.secrets[id]) return;
    state.secrets[id] = true;
    toast("见证 " + secretsFound() + " / 4");
  }

  function takeItem(id) {
    if (state.inventory.includes(id)) return;
    state.inventory.push(id);
    renderInventory();
    toast("获得：" + ITEMS[id].name);
    updateDoor();
  }

  function removeItem(id) {
    state.inventory = state.inventory.filter((x) => x !== id);
    if (state.selectedItem === id) state.selectedItem = null;
    renderInventory();
  }

  function hasSmallKey() {
    return state.inventory.includes("smallkey");
  }

  function updateDoor() {
    const door = $('[data-id="door"]');
    if (!door) return;
    if (hasAllTokens()) {
      door.classList.remove("locked");
      door.classList.add("pulse");
    } else {
      door.classList.add("locked");
      door.classList.remove("pulse");
    }
  }

  function setHotspotDone(id) {
    const el = $('[data-id="' + id + '"]');
    if (el) el.classList.add("done");
  }

  function showIntroStep() {
    const step = INTRO[state.introIndex];
    const curator = $("#intro-curator");
    if (!step) {
      if (curator) {
        curator.hidden = true;
        curator.classList.remove("is-on", "is-leaving");
      }
      showScene("desk");
      setCaption(
        "#desk-caption",
        "值班桌很暗。"
      );
      return;
    }
    trySetBg($("#intro-bg"), step.bg);
    $("#intro-speaker").textContent = step.speaker;
    $("#intro-text").textContent = step.text;
    $("#btn-intro-next").textContent =
      state.introIndex >= INTRO.length - 1 ? "开始巡馆" : "继续";
    if (curator) {
      curator.hidden = step.curator === "off";
      curator.classList.toggle("is-on", step.curator === "on");
      curator.classList.toggle("is-leaving", step.curator === "leaving");
    }
  }

  function setDeskLamp(on) {
    const lamp = $("#desk-lamp");
    const desk = $("#scene-desk");
    if (lamp) lamp.classList.toggle("is-lit", !!on);
    if (desk) desk.classList.toggle("lamp-lit", !!on);
  }

  function onFloorHotspot(id, el) {
    if (id === "lamp") {
      if (state.lampOn) {
        toast("灯已经亮着。");
        return;
      }
      state.lampOn = true;
      setDeskLamp(true);
      $('[data-id="drawer"]').classList.remove("locked");
      $('[data-id="smallkey"]').classList.remove("locked");
      $('[data-id="smallkey"]').classList.add("pulse");
      $('[data-id="lamp"]').classList.add("done");
      $('[data-id="lamp"]').classList.remove("pulse");
      openModal({
        title: "煤油灯",
        img: "prop_lamp_on.png",
        body: "黄铜灯罩里，火舌安静地立起。抽屉看得见了，锁还扣着。\n\n灯油还温着。馆长离开不久。",
        onClose: () =>
          setCaption("#desk-caption", "抽屉还锁着。"),
      });
      return;
    }

    if (id === "smallkey") {
      if (!state.lampOn) {
        toast("太暗了。先点亮煤油灯。");
        return;
      }
      if (hasSmallKey() || state.inventory.includes("key")) {
        toast("这里已经空了。");
        return;
      }
      openModal({
        title: "小钥匙",
        img: "prop_small_key.png",
        body: "灯座旁边，一枚发暗的小钥匙。",
        onClose: () => {
          takeItem("smallkey");
          setHotspotDone("smallkey");
          $('[data-id="smallkey"]').classList.remove("pulse");
          setCaption("#desk-caption", "");
        },
      });
      return;
    }

    if (id === "drawer") {
      if (!state.lampOn) {
        toast("太暗了。先点亮煤油灯。");
        return;
      }
      if (state.inventory.includes("key")) {
        toast("抽屉里已经空了。");
        return;
      }
      if (!hasSmallKey()) {
        openModal({
          title: "值班桌抽屉",
          body: "锁还扣着。",
        });
        return;
      }
      if (state.selectedItem !== "smallkey") {
        toast("先从下方拿起你要试的东西。");
        return;
      }
      openModal({
        title: "值班桌抽屉",
        img: "prop_key.png",
        body: "小钥匙转开了锁。最深处躺着一枚黄铜钥匙，蜡封还在。\n\n他把它留在这里，即便自己读不出那本书里的人。",
        onClose: () => {
          removeItem("smallkey");
          takeItem("key");
          setHotspotDone("drawer");
          setCaption("#desk-caption", "");
        },
      });
      return;
    }

    if (id === "miss") {
      const spine = (el && el.dataset.spine) || "";
      if (state.selectedItem === "card") {
        openModal({
          title: "书架",
          body: spine
            ? "书脊上印着 " + spine + "。书脊下方的细槽没有动。"
            : "书脊下方的细槽没有动。",
        });
        return;
      }
      openModal({
        title: "书架",
        body: spine
          ? "书脊上印着 " + spine + "。抽不动。书脊下方有一道细槽。"
          : "抽不动。书脊下方有一道细槽。",
      });
      return;
    }

    if (id === "shelf") {
      if (state.inventory.includes("note")) {
        toast("夹缝里已经空了。");
        return;
      }
      if (state.selectedItem === "card") {
        openModal({
          title: "《图书馆管理学》",
          img: "prop_note.png",
          body:
            "书脊上印着 B-17。细槽里的止销退了。夹缝里掉出一张残页。笔迹像是伊洛恩的。\n\nShe is not lost. She has been written into the book.\n她并非失踪。她被写进了书里。\n\n背面还有一行：「写入者读不出自己写进去的人。」",
          onClose: () => {
            removeItem("card");
            takeItem("note");
            setHotspotDone("shelf");
            setCaption("#stacks-caption", "");
          },
        });
        return;
      }
      openModal({
        title: "书架",
        body: "书脊上印着 B-17。抽不动。书脊下方有一道细槽。",
      });
      return;
    }

    if (id === "cart") {
      if (state.inventory.includes("flower")) {
        toast("还书车上只剩灰尘。");
        return;
      }
      openModal({
        title: "遗忘还书车",
        img: "prop_flower.png",
        body: "一枚野榆干花书签卡在还书缝里。花瓣脆得像旧纸。\n\n这是她生前最爱的花。有人把它留在这里，像在等人把她读回来。",
        onClose: () => {
          takeItem("flower");
          setHotspotDone("cart");
          setCaption("#lobby-caption", "");
        },
      });
      return;
    }

    if (id === "memo" || id === "cards" || id === "ink" || id === "photo") {
      const s = SECRETS[id];
      openModal({
        title: s.title,
        img: s.img,
        body: s.body,
        onClose: () => {
          markSecret(id);
          setHotspotDone(id);
          if (id === "cards" && !state.inventory.includes("card") && !state.inventory.includes("note")) {
            takeItem("card");
          }
        },
      });
      return;
    }

    if (id === "door") {
      if (!hasAllTokens()) {
        toast("打不开。");
        return;
      }
      openModal({
        title: "包铁橡木门",
        body: "钥匙咬合。地下的冷气涌上来。\n\n「地下二层藏着一本书，它已经等候了一百年。」\n\n先要经过石阶。",
        onClose: () => {
          showScene("b1");
          $("#b1-text").textContent =
            "潮湿的石墙。滴水声。远处似乎有人在翻书页——或只是风。\n\n这里没有道具。只有向下的路。";
          setCaption("#b1-caption", "继续下行，到达书室。");
        },
      });
    }
  }

  function resetB2Slots() {
    state.placedB2 = { key: false, note: false, flower: false };
    $$("#b2-slots .drop-slot").forEach((el) => {
      el.classList.remove("filled");
      if (el.dataset.slot === "key") el.textContent = "门";
      else if (el.dataset.slot === "note") el.textContent = "笔";
      else el.textContent = "脊";
    });
  }

  function resetBookSlots() {
    state.placedBook = { key: false, note: false, flower: false };
    state.monoIndex = 0;
    state.bookReady = false;
    $("#silhouette").hidden = true;
    $("#monologue").hidden = true;
    $("#btn-last-page").hidden = true;
    $("#book-slots").style.display = "";
    const map = {
      key: "门",
      note: "笔",
      flower: "少女",
    };
    $$("#book-slots .drop-slot").forEach((el) => {
      el.classList.remove("filled");
      el.hidden = false;
      el.textContent = map[el.dataset.slot];
    });
  }

  function tryPlace(slotEl, itemId) {
    const need = slotEl.dataset.slot;
    if (!itemId || itemId !== need) {
      toast("不对。这件信物不属于这里。");
      return false;
    }
    if (state.scene === "b2") {
      if (state.placedB2[need]) return false;
      state.placedB2[need] = true;
      slotEl.classList.add("filled");
      slotEl.textContent = ITEMS[need].name;
      state.selectedItem = null;
      renderInventory();
      toast(ITEMS[need].tip);
      if (Object.values(state.placedB2).every(Boolean)) {
        setTimeout(() => {
          resetBookSlots();
          Object.keys(state.placedB2).forEach((k) => {
            state.placedB2[k] = false;
          });
          showScene("bookInner");
          setCaption("#book-caption", "");
          toast("书页翻开了。你无法再回到一楼。");
        }, 600);
      }
      return true;
    }
    if (state.scene === "bookInner") {
      if (state.placedBook[need]) return false;
      state.placedBook[need] = true;
      slotEl.classList.add("filled");
      slotEl.textContent = ITEMS[need].name;
      state.selectedItem = null;
      renderInventory();
      openModal({
        title: "书页显影",
        kicker: "信物对照 · " + ITEMS[need].name,
        img: need === "flower" ? "girl_silhouette.png" : ITEMS[need].img,
        reveal: true,
        body: BOOK_REVEALS[need],
        onClose: () => {
          if (need === "flower") $("#silhouette").hidden = false;
          if (Object.values(state.placedBook).every(Boolean)) startMonologue();
        },
      });
      return true;
    }
    return false;
  }

  function bindSlots(containerSel) {
    $$(containerSel + " .drop-slot").forEach((slot) => {
      slot.addEventListener("click", () => {
        if (!state.selectedItem) {
          toast("先从下方信物栏选一件，再点这里。");
          return;
        }
        tryPlace(slot, state.selectedItem);
      });
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("drag-over");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("drag-over");
        const id = e.dataTransfer.getData("text/plain") || state.selectedItem;
        tryPlace(slot, id);
      });
    });
  }

  function startMonologue() {
    state.monoIndex = 0;
    $("#monologue").hidden = false;
    $("#book-slots").style.display = "none";
    setCaption("#book-caption", "");
    showMonoLine();
  }

  function showMonoLine() {
    $("#mono-text").textContent = MONOLOGUE[state.monoIndex] || "";
    const btn = $("#btn-mono-next");
    btn.textContent =
      state.monoIndex >= MONOLOGUE.length - 1
        ? "翻向最后一页"
        : "继续";
  }

  function onMonoNext() {
    if (state.monoIndex < MONOLOGUE.length - 1) {
      state.monoIndex += 1;
      showMonoLine();
      return;
    }
    $("#monologue").hidden = true;
    $("#btn-last-page").hidden = false;
    state.bookReady = true;
    setCaption(
      "#book-caption",
      "点击「最后一页」。结局由你今夜见证的深度决定。"
    );
  }

  function finishGame() {
    const trueEnd = secretsFound() === 4;
    localStorage.setItem(STORAGE.cleared, "1");
    if (trueEnd) localStorage.setItem(STORAGE.trueEnding, "1");
    trySetBg($("#ending-bg"), trueEnd ? "ending_true.png" : "ending_main.png");

    if (trueEnd) {
      $("#ending-title").textContent = "真结局 · 被读出来";
      $("#ending-body").textContent =
        "空白行浮现：伊洛恩·沃斯。剪影走到灯下。借阅卡上的字重新清晰。\n你完成了外人的完整见证——条目被重编，旧删除令作废。\n母亲仍不在任何一页里：已抹除，没有残响可供召回。";
      $("#ending-epilogue").textContent =
        "这一夜，终于有人读到了最后一页。\n别再打开禁区的书。自由回来了，但没有无限试错。";
    } else {
      $("#ending-title").textContent = "主线结局 · 书页之中的人";
      $("#ending-body").textContent =
        "你拼出了真相（见证 " +
        secretsFound() +
        "/4），却没有读全所有伤痕。\n书页合上。天亮。删除令依旧挂起，伊洛恩仍停在暂存之中。\n母亲的名字仍然召不回来。";
      $("#ending-epilogue").textContent =
        "有些人并未离去，只是被写进了一本不该被书写的书里。\n理解 ≠ 拯救。";
    }
    showScene("ending");
  }

  function newGame() {
    playBgm();
    state.introIndex = 0;
    state.lampOn = false;
    state.inventory = [];
    state.placedB2 = { key: false, note: false, flower: false };
    state.placedBook = { key: false, note: false, flower: false };
    state.secrets = { memo: false, cards: false, ink: false, photo: false };
    state.selectedItem = null;
    state.monoIndex = 0;
    state.bookReady = false;
    $("#book-slots").style.display = "";
    $$(".hotspot").forEach((h) => {
      h.classList.remove("done", "pulse");
      if (h.dataset.id === "drawer" || h.dataset.id === "door" || h.dataset.id === "smallkey") h.classList.add("locked");
      else h.classList.remove("locked");
    });
    const lampPin = $('[data-id="lamp"]');
    if (lampPin) lampPin.classList.add("pulse");
    setDeskLamp(false);
    showScene("intro");
    showIntroStep();
  }

  function bind() {
    document.addEventListener(
      "click",
      (e) => {
        const btn = e.target.closest("button");
        if (!btn || !btn.closest(".title-plate, .dialogue, .monologue")) return;
        playClickSfx();
      },
      true
    );

    $("#btn-start").addEventListener("click", newGame);
    $("#btn-music").addEventListener("click", toggleBgm);
    $("#btn-intro-next").addEventListener("click", () => {
      state.introIndex += 1;
      showIntroStep();
    });
    $("#btn-b1-down").addEventListener("click", () => {
      resetB2Slots();
      showScene("b2");
      setCaption("#b2-caption", "");
    });
    $("#btn-title").addEventListener("click", () => {
      showScene("title");
      $("#inventory").hidden = true;
    });
    $("#btn-mono-next").addEventListener("click", onMonoNext);
    $("#btn-last-page").addEventListener("click", finishGame);
    $("#art-zoom").addEventListener("click", closeArtZoom);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeArtZoom();
    });

    $$(".room-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        const goto = btn.dataset.goto;
        if (!EXPLORE_SCENES.includes(goto)) return;
        showScene(goto);
        if (goto === "desk") {
          let line = "先点煤油灯。";
          if (state.lampOn && !state.inventory.includes("key") && !state.inventory.includes("smallkey"))
            line = "抽屉还锁着。";
          else if (state.inventory.includes("smallkey")) line = "";
          else if (state.inventory.includes("key")) line = "";
          setCaption("#desk-caption", line);
        }
        if (goto === "stacks") setCaption("#stacks-caption", "");
        if (goto === "lobby")
          setCaption("#lobby-caption", "还书廊。推车、旧相与地下室门。");
      });
    });

    ["#desk-hotspots", "#stacks-hotspots", "#lobby-hotspots"].forEach((sel) => {
      $$(sel + " .hotspot").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.classList.contains("locked")) {
            if (btn.dataset.id === "drawer" || btn.dataset.id === "smallkey")
              toast("太暗了。先点亮煤油灯。");
            else if (btn.dataset.id === "door") toast("打不开。");
            return;
          }
          onFloorHotspot(btn.dataset.id, btn);
        });
      });
    });

    bindSlots("#b2-slots");
    bindSlots("#book-slots");
  }

  bind();
  hydrateImages();
  syncMusicBtn();
})();
