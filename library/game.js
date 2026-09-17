(() => {
  const STORAGE = {
    cleared: "voss_library_cleared",
    trueEnding: "voss_library_true",
  };

  const ITEMS = {
    key: {
      id: "key",
      name: "黄铜蜡封钥匙",
      img: "prop_key.jpg",
      tip: "封着家族蜡印的钥匙。",
    },
    note: {
      id: "note",
      name: "批注残页",
      img: "prop_note.jpg",
      tip: "夹在《图书馆管理学》里的手写残页。",
    },
    flower: {
      id: "flower",
      name: "野榆干花书签",
      img: "prop_flower.jpg",
      tip: "她生前喜爱的花。",
    },
  };

  const SECRETS = {
    memo: {
      id: "memo",
      title: "馆长手写便签",
      img: "prop_memo.jpg",
      body: "字迹微微发抖：\n\nDo not read the final page.\n不要阅读最后一页。",
    },
    cards: {
      id: "cards",
      title: "手写借阅卡（两张）",
      img: "prop_card.jpg",
      body:
        "伊洛恩·沃斯：借阅记录停在失踪当日，姓名正在褪色。\n\n沃斯夫人：姓名栏完全空白。配偶栏仅写着 —— Voss。",
    },
    ink: {
      id: "ink",
      title: "干涸墨水瓶",
      img: "prop_ink.jpg",
      body: "鹅毛笔斜靠在瓶侧。瓶口的墨早已干裂成黑痂。\n有人曾在这里写下活人的名字。",
    },
    photo: {
      id: "photo",
      title: "撕裂的银盐旧相纸",
      img: "prop_photo.jpg",
      body: "女人的面部被撕走了。只剩衣裙一角，与一只失去归属的手。\n没有名字。连图像也在消解。",
    },
  };

  const BOOK_REVEALS = {
    key: "地下入口来自那场违训仪式。\n家族祖训：绝不主动把活人写进《未编目之书》。",
    note: "她读得太深，编目开始清除她。\n父亲用干墨，把「伊洛恩·沃斯」写进了空白古书。",
    flower:
      "他以为自己是在救我。\n可我只是……再也走不出去。",
  };

  const MONOLOGUE = [
    "十年了。外面的人只记得：馆长的女儿失踪了。",
    "母亲连残响都没有。我查过所有卡片——她的名字写不上来。",
    "他怕再犹豫一次，人就蒸发。所以他把我写了进去。",
    "写入者读不出自己写进去的人。他只能把钥匙拆开，把这一夜交给你。",
  ];

  const state = {
    scene: "title",
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

  function trySetBg(el, file) {
    if (!el || !file) return;
    const url = `images/${file}`;
    const img = new Image();
    img.onload = () => {
      el.style.setProperty("--bg", `url("${url}")`);
      el.classList.add("has-img");
    };
    img.onerror = () => {
      /* keep CSS gradient placeholder */
    };
    img.src = url;
  }

  function hydrateImages() {
    $$(".scene-bg[data-img], #blank-book[data-img], #silhouette[data-img]").forEach((el) => {
      trySetBg(el, el.dataset.img);
    });
  }

  function updateStars() {
    const cleared = localStorage.getItem(STORAGE.cleared) === "1";
    const trueEnd = localStorage.getItem(STORAGE.trueEnding) === "1";
    const el = $("#stars");
    if (!cleared) {
      el.textContent = "";
      return;
    }
    el.textContent = trueEnd ? "★★" : "★";
  }

  function showScene(name) {
    state.scene = name;
    $$(".scene").forEach((s) => s.classList.toggle("active", s.dataset.scene === name));
    const inv = $("#inventory");
    inv.hidden = !(name === "floor1" || name === "b2" || name === "bookInner");
    if (name === "bookInner") {
      // lock: cannot return to floor1
    }
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
      btn.className = "inv-item" + (state.selectedItem === id ? " selected" : "") + (used ? " used" : "");
      btn.dataset.item = id;
      btn.innerHTML = `<span class="inv-thumb" style="background-image:url('images/${item.img}')"></span><span>${item.name}</span>`;
      btn.addEventListener("click", () => {
        if (used) return;
        state.selectedItem = state.selectedItem === id ? null : id;
        renderInventory();
        toast(state.selectedItem ? `已选中：${item.name}（点插槽放入）` : "取消选择");
      });
      // drag support
      btn.draggable = !used;
      btn.addEventListener("dragstart", (e) => {
        if (used) return;
        state.selectedItem = id;
        e.dataTransfer.setData("text/plain", id);
      });
      box.appendChild(btn);
    });
  }

  function openModal({ title, body, img, onClose }) {
    $("#modal-title").textContent = title;
    $("#modal-body").textContent = body;
    const art = $("#modal-art");
    art.style.backgroundImage = img ? `url("images/${img}")` : "";
    $("#modal").hidden = false;
    $("#modal-close").onclick = () => {
      $("#modal").hidden = true;
      if (onClose) onClose();
    };
  }

  function markSecret(id) {
    if (state.secrets[id]) return;
    state.secrets[id] = true;
    const n = secretsFound();
    toast(`见证 ${n} / 4`);
  }

  function takeItem(id) {
    if (state.inventory.includes(id)) return;
    state.inventory.push(id);
    renderInventory();
    toast(`获得：${ITEMS[id].name}`);
    updateDoor();
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
    const el = $(`[data-id="${id}"]`);
    if (el) el.classList.add("done");
  }

  function onFloor1(id) {
    if (id === "lamp") {
      if (state.lampOn) {
        toast("灯已经亮着。");
        return;
      }
      state.lampOn = true;
      $('[data-id="drawer"]').classList.remove("locked");
      $('[data-id="lamp"]').classList.add("done");
      trySetBg($('[data-id="lamp"]'), null);
      openModal({
        title: "煤油灯",
        img: "prop_lamp_on.jpg",
        body: "黄铜灯罩里，火舌安静地立起。\n值班桌抽屉的轮廓清晰起来。",
        onClose: () => setCaption("#floor1-caption", "抽屉可以打开了。也可四处看看被藏起的痕迹。"),
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
      openModal({
        title: "值班桌抽屉",
        img: "prop_key.jpg",
        body: "最深处，一枚黄铜钥匙。蜡印尚未剥落——沃斯家族的纹章。",
        onClose: () => {
          takeItem("key");
          setHotspotDone("drawer");
          setCaption("#floor1-caption", "钥匙在手。还缺残页与干花。");
        },
      });
      return;
    }

    if (id === "shelf") {
      if (state.inventory.includes("note")) {
        toast("这本书的夹缝已经空了。");
        return;
      }
      openModal({
        title: "《图书馆管理学》",
        img: "prop_note.jpg",
        body: "书页夹缝里掉出一张残页。\n\nShe is not lost. She has been written into the book.\n她并非失踪。她被写进了书里。",
        onClose: () => {
          takeItem("note");
          setHotspotDone("shelf");
        },
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
        img: "prop_flower.jpg",
        body: "一枚野榆干花书签卡在还书缝里。花瓣脆得像旧纸。",
        onClose: () => {
          takeItem("flower");
          setHotspotDone("cart");
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
        },
      });
      return;
    }

    if (id === "door") {
      if (!hasAllTokens()) {
        toast("门上的锁缺三样东西才能开：钥匙、残页、干花。");
        return;
      }
      openModal({
        title: "包铁橡木门",
        body: "钥匙咬合。地下的冷气涌上来。\n\n「地下二层藏着一本书，它已经等候了一百年。」",
        onClose: () => {
          // entering basement locks return — no floor1 button after this
          resetB2Slots();
          showScene("b2");
          setCaption("#b2-caption", "把三件信物放到《未编目之书》上。");
        },
      });
    }
  }

  function resetB2Slots() {
    state.placedB2 = { key: false, note: false, flower: false };
    $$("#b2-slots .drop-slot").forEach((el) => {
      el.classList.remove("filled");
      el.textContent =
        el.dataset.slot === "key"
          ? "门 · 放钥匙"
          : el.dataset.slot === "note"
            ? "笔 · 放残页"
            : "脊 · 放干花";
    });
  }

  function resetBookSlots() {
    state.placedBook = { key: false, note: false, flower: false };
    state.monoIndex = 0;
    state.bookReady = false;
    $("#silhouette").hidden = true;
    $("#monologue").hidden = true;
    $("#btn-last-page").hidden = true;
    $$("#book-slots .drop-slot").forEach((el) => {
      el.classList.remove("filled");
      el.hidden = false;
      const map = { key: "插图【门】", note: "插图【鹅毛笔】", flower: "插图【少女】" };
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
          // tokens remain in inventory for book-inner placement
          Object.keys(state.placedB2).forEach((k) => {
            state.placedB2[k] = false;
          });
          showScene("bookInner");
          setCaption("#book-caption", "将信物拖到对应插图上。对照完成后，故事会自己开口。");
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
        body: BOOK_REVEALS[need],
        onClose: () => {
          if (need === "flower") {
            $("#silhouette").hidden = false;
          }
          if (Object.values(state.placedBook).every(Boolean)) {
            startMonologue();
          }
        },
      });
      return true;
    }
    return false;
  }

  function bindSlots(containerSel) {
    $$(`${containerSel} .drop-slot`).forEach((slot) => {
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
    const text = MONOLOGUE[state.monoIndex];
    $("#mono-text").textContent = text || "";
    const btn = $("#btn-mono-next");
    if (state.monoIndex >= MONOLOGUE.length - 1) {
      btn.textContent = "……（翻向最后一页）";
    } else {
      btn.textContent = "……";
    }
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
    setCaption("#book-caption", "点击「最后一页」。结局由你今夜见证的深度决定。");
  }

  function finishGame() {
    const trueEnd = secretsFound() === 4;
    localStorage.setItem(STORAGE.cleared, "1");
    if (trueEnd) localStorage.setItem(STORAGE.trueEnding, "1");
    updateStars();

    const bg = $("#ending-bg");
    bg.className = "scene-bg" + (trueEnd ? "" : "");
    trySetBg(bg, trueEnd ? "ending_true.jpg" : "ending_main.jpg");

    if (trueEnd) {
      $("#ending-title").textContent = "真结局 · 被读出来";
      $("#ending-body").textContent =
        "空白行浮现：伊洛恩·沃斯。剪影走到灯下。借阅卡上的字重新清晰。\n完整的见证重编了条目。旧删除令作废。\n母亲仍不在任何一页里——没有残响可供召回。";
      $("#ending-epilogue").textContent =
        "这一夜，终于有人读到了最后一页。\n永远不要再翻开禁区的藏书。";
    } else {
      $("#ending-title").textContent = "主线结局 · 书页之中的人";
      $("#ending-body").textContent =
        `你拼出了真相（见证 ${secretsFound()}/4），却没有读全所有伤痕。\n书页合上。天亮。删除令依旧挂起，伊洛恩仍停在暂存之中。`;
      $("#ending-epilogue").textContent =
        "有些人并未离去，只是被写进了一本不该被书写的书里。\n理解 ≠ 拯救。";
    }
    showScene("ending");
  }

  function newGame() {
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
      if (h.dataset.id === "drawer" || h.dataset.id === "door") h.classList.add("locked");
      else h.classList.remove("locked");
    });
    setCaption("#floor1-caption", "夜馆空无一人。先点亮煤油灯。");
    showScene("floor1");
    renderInventory();
  }

  function bind() {
    $("#btn-start").addEventListener("click", newGame);
    $("#btn-title").addEventListener("click", () => {
      updateStars();
      showScene("title");
      $("#inventory").hidden = true;
    });
    $("#btn-reset").addEventListener("click", () => {
      if (!confirm("清除通关标记（★ / ★★）？")) return;
      localStorage.removeItem(STORAGE.cleared);
      localStorage.removeItem(STORAGE.trueEnding);
      updateStars();
      toast("存档已清除");
    });
    $("#btn-mono-next").addEventListener("click", onMonoNext);
    $("#btn-last-page").addEventListener("click", finishGame);

    $$("#floor1-hotspots .hotspot").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("locked")) {
          if (btn.dataset.id === "drawer") toast("太暗了。先点亮煤油灯。");
          else if (btn.dataset.id === "door") toast("还不能打开。");
          return;
        }
        onFloor1(btn.dataset.id);
      });
    });

    bindSlots("#b2-slots");
    bindSlots("#book-slots");
  }

  bind();
  hydrateImages();
  updateStars();
})();
