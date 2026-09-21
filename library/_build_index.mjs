/**
 * Builds library/index.html as UTF-8 (no raw CJK in this source — avoids pipeline mojibake).
 * Run: node _build_index.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>\u672a\u7f16\u76ee\u4e4b\u4e66 \u00b7 The Uncatalogued Book</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,300&family=Noto+Serif+SC:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="app">
    <header class="hud">
      <button id="btn-reset" class="ghost-btn" type="button" title="\u6e05\u9664\u5b58\u6863">\u91cd\u7f6e</button>
    </header>

    <section id="scene-title" class="scene active" data-scene="title">
      <div class="scene-bg" data-img="library_overview.png"></div>
      <div class="title-panel">
        <aside class="title-plate">
          <p class="title-year">\u4e00\u4e5d\u4e8c\u516b</p>
          <h1 class="title-zh">\u672a\u7f16\u76ee\u4e4b\u4e66</h1>
          <p class="title-en">The Uncatalogued Book</p>
          <p class="title-line">\u4eca\u591c\uff0c\u4f60\u66ff\u9986\u957f\u503c\u5b88\u8fd9\u5ea7\u591c\u9986\u3002</p>
          <button id="btn-start" class="primary-btn title-start" type="button">\u5f00\u59cb\u503c\u591c</button>
        </aside>
      </div>
    </section>

    <section id="scene-intro" class="scene" data-scene="intro">
      <div class="scene-bg" id="intro-bg" data-img="library_overview.png"></div>
      <div class="intro-curator" id="intro-curator" data-img="curator_silhouette.png" hidden></div>
      <div class="dialogue" id="intro-dialogue">
        <p class="dialogue-speaker" id="intro-speaker"></p>
        <p class="dialogue-text" id="intro-text"></p>
        <button id="btn-intro-next" class="primary-btn" type="button">\u7ee7\u7eed</button>
      </div>
    </section>

    <section id="scene-desk" class="scene" data-scene="desk">
      <div class="scene-bg" data-img="floor1_desk.png"></div>
      <div class="desk-lamp" id="desk-lamp" aria-hidden="true"></div>
      <div class="room-nav">
        <span class="room-name">\u4e00\u697c \u00b7 \u503c\u73ed\u684c</span>
        <button class="ghost-btn room-link" type="button" data-goto="stacks">\u9605\u89c8\u5eca ></button>
      </div>
      <div class="hotspots" id="desk-hotspots">
        <button class="hotspot pulse" data-id="lamp" style="left:7%;top:60%" type="button" aria-label="\u7164\u6cb9\u706f"></button>
        <button class="hotspot locked" data-id="drawer" style="left:52%;top:82%" type="button" aria-label="\u503c\u73ed\u684c\u62bd\u5c49"></button>
        <button class="hotspot" data-id="memo" style="left:20%;top:70%" type="button" aria-label="\u4fbf\u7b7e"></button>
      </div>
      <p class="scene-caption" id="desk-caption"></p>
    </section>

    <section id="scene-stacks" class="scene" data-scene="stacks">
      <div class="scene-bg" data-img="floor1_stacks.png" id="stacks-bg"></div>
      <div class="room-nav">
        <button class="ghost-btn room-link" type="button" data-goto="desk">< \u503c\u73ed\u684c</button>
        <span class="room-name">\u4e00\u697c \u00b7 \u9605\u89c8\u5eca</span>
        <button class="ghost-btn room-link" type="button" data-goto="lobby">\u8fd8\u4e66\u5eca ></button>
      </div>
      <div class="hotspots" id="stacks-hotspots">
        <button class="hotspot" data-id="shelf" style="left:12%;top:40%" type="button" aria-label="\u4e66\u67b6"></button>
        <button class="hotspot" data-id="cards" style="left:38%;top:74%" type="button" aria-label="\u501f\u9605\u5361\u7247\u76d2"></button>
        <button class="hotspot" data-id="ink" style="left:84%;top:72%" type="button" aria-label="\u58a8\u6c34\u74f6"></button>
      </div>
      <p class="scene-caption" id="stacks-caption"></p>
    </section>

    <section id="scene-lobby" class="scene" data-scene="lobby">
      <div class="scene-bg" data-img="floor1_lobby.png" id="lobby-bg"></div>
      <div class="lobby-prop lobby-photo" id="lobby-photo" aria-hidden="true"></div>
      <div class="room-nav">
        <button class="ghost-btn room-link" type="button" data-goto="stacks">< \u9605\u89c8\u5eca</button>
        <span class="room-name">\u4e00\u697c \u00b7 \u8fd8\u4e66\u5eca</span>
      </div>
      <div class="hotspots" id="lobby-hotspots">
        <button class="hotspot" data-id="cart" style="left:38%;top:60%" type="button" aria-label="\u8fd8\u4e66\u8f66"></button>
        <button class="hotspot" data-id="photo" style="left:34%;top:38%" type="button" aria-label="\u65e7\u76f8\u7eb8"></button>
        <button class="hotspot locked" data-id="door" style="left:82%;top:40%" type="button" aria-label="\u5730\u4e0b\u5ba4\u95e8"></button>
      </div>
      <p class="scene-caption" id="lobby-caption"></p>
    </section>

    <section id="scene-b1" class="scene" data-scene="b1">
      <div class="scene-bg cold" data-img="b1_stairs.png"></div>
      <div class="b1-panel">
        <p class="b1-kicker">\u5730\u4e0b\u4e00\u5c42 \u00b7 \u77f3\u9636</p>
        <p class="b1-text" id="b1-text"></p>
        <button id="btn-b1-down" class="primary-btn" type="button">\u7ee7\u7eed\u4e0b\u884c</button>
      </div>
      <p class="scene-caption" id="b1-caption"></p>
    </section>

    <section id="scene-b2" class="scene" data-scene="b2">
      <div class="scene-bg cold" data-img="b2_vault_room.png"></div>
      <div class="vault-stage">
        <div class="book-pedestal" id="blank-book" data-img="blank_book.png" title="\u672a\u7f16\u76ee\u4e4b\u4e66">
          <span class="book-label">\u300a\u672a\u7f16\u76ee\u4e4b\u4e66\u300b</span>
        </div>
        <div class="drop-slots" id="b2-slots">
          <div class="drop-slot" data-slot="key">\u95e8</div>
          <div class="drop-slot" data-slot="note">\u7b14</div>
          <div class="drop-slot" data-slot="flower">\u810a</div>
        </div>
      </div>
      <p class="scene-caption" id="b2-caption"></p>
    </section>

    <section id="scene-book" class="scene" data-scene="bookInner">
      <div class="scene-bg parchment" data-img="book_inner.png"></div>
      <div class="silhouette" id="silhouette" hidden data-img="girl_silhouette.png"></div>
      <div class="book-slots" id="book-slots">
        <div class="drop-slot page-slot" data-slot="key">\u95e8</div>
        <div class="drop-slot page-slot" data-slot="note">\u7b14</div>
        <div class="drop-slot page-slot" data-slot="flower">\u5c11\u5973</div>
      </div>
      <div class="monologue" id="monologue" hidden>
        <p id="mono-text"></p>
        <button id="btn-mono-next" class="primary-btn" type="button">\u7ee7\u7eed</button>
      </div>
      <button id="btn-last-page" class="primary-btn last-page-btn" type="button" hidden>\u6700\u540e\u4e00\u9875</button>
      <p class="scene-caption" id="book-caption"></p>
    </section>

    <section id="scene-ending" class="scene" data-scene="ending">
      <div class="scene-bg" id="ending-bg"></div>
      <div class="ending-panel">
        <h2 id="ending-title"></h2>
        <p id="ending-body"></p>
        <p id="ending-epilogue" class="epilogue"></p>
        <button id="btn-title" class="primary-btn" type="button">\u8fd4\u56de\u6807\u9898</button>
      </div>
    </section>

    <aside id="inventory" class="inventory" hidden>
      <p class="inv-label">\u4fe1\u7269</p>
      <div id="inv-items" class="inv-items"></div>
    </aside>

    <div id="modal" class="modal" hidden>
      <div class="modal-card" id="modal-card">
        <p class="modal-kicker" id="modal-kicker" hidden></p>
        <div class="modal-art-wrap" id="modal-art-wrap" hidden>
          <button class="modal-art" id="modal-art" type="button" aria-label="\u70b9\u51fb\u653e\u5927" title="\u70b9\u51fb\u653e\u5927"></button>
        </div>
        <h3 id="modal-title"></h3>
        <div class="modal-rule" aria-hidden="true"></div>
        <p id="modal-body"></p>
        <button id="modal-close" class="primary-btn" type="button">\u5408\u4e0a</button>
      </div>
    </div>

    <div id="art-zoom" class="art-zoom" hidden>
      <div class="art-zoom-frame">
        <div class="art-zoom-img" id="art-zoom-img"></div>
      </div>
    </div>

    <div id="toast" class="toast" hidden></div>
  </div>
  <script src="game.js"></script>
</body>
</html>
`;

const outPath = path.join(__dirname, "index.html");
// Template uses \uXXXX escapes (ASCII-safe in source); Node expands them when parsing this file.
fs.writeFileSync(outPath, html, { encoding: "utf8" });

const verify = fs.readFileSync(outPath, "utf8");
const ok = verify.includes("\u672a\u7f16\u76ee\u4e4b\u4e66") && !verify.includes("?????");
console.log("wrote", outPath, "bytes", Buffer.byteLength(verify, "utf8"), "ok", ok);
if (!ok) {
  console.error("sample title:", verify.match(/<title>[^<]+/)?.[0]);
  process.exit(1);
}
