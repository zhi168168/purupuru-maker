import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = "https://www.purupurumaker.pro";

const locales = {
  ja: {
    htmlLang: "ja",
    label: "日本語",
    homeTitle: "purupuru maker - 無料の画像揺れメーカー",
    homeDescription:
      "purupuru makerは、画像をアップロードし、動かしたい範囲を塗って、ぷるぷるした揺れをプレビューし、MP4またはGIFを書き出せる無料のブラウザツールです。",
    kicker: "ブラウザで作る画像揺れアニメーション",
    heroTitle: "purupuru maker: 無料の画像揺れメーカー",
    heroBody:
      "purupuru makerでは、イラストをアップロードし、動かしたい部分を塗り、やわらかいジェリーのような動きを確認して、短いMP4またはGIFとして書き出せます。画像は作業中もブラウザ内に残ります。",
    howTitle: "使い方",
    steps: [
      ["PNG、JPEG、WebP画像をアップロード", "画像をブラウザ内で開き、モーションプレビュー用の柔軟なメッシュを準備します。"],
      ["モーションマスクを塗る", "髪、服、ステッカー、アバターなど、弾ませたい細部をブラシで塗ります。"],
      ["プレビューして書き出す", "強さ、速度、Spring、Damping、Motion over timeを調整し、MP4またはGIFとして書き出します。"],
    ],
    featuresTitle: "purupuru makerの機能",
    featuresBody:
      "デスクトップソフトを入れたり、作品をリモートの編集サービスへアップロードしたりせずに、すばやく画像をアニメーション化したいクリエイター向けのツールです。",
    features: [
      "画像編集はブラウザ内でローカル処理",
      "ブラシで動かす範囲を選べるモーションマスク",
      "WebGLメッシュ変形によるリアルタイムプレビュー",
      "強さ、速度、Spring、Damping、Motion over timeを調整可能",
      "SNS、ステッカー、ミーム、アバター向けのMP4/GIF書き出し",
    ],
    faqTitle: "FAQ",
    resourcesTitle: "関連リソース",
    independent: "purupuru makerは独立したブラウザツールです。",
    privacy: "プライバシー",
    terms: "利用規約",
    nav: {
      start: "開始",
      faq: "FAQ",
      terms: "利用規約",
      what: "purupuru makerとは？",
      how: "purupuru makerの使い方",
      images: "画像はアップロードされますか？",
    },
    pages: {
      "what-is-purupuru-maker": {
        title: "purupuru makerとは？",
        description:
          "purupuru makerは、静止画からやわらかいぷるぷる風アニメーションを作れる無料のブラウザベース画像揺れメーカーです。",
        sections: [
          ["名前の由来", "purupuru makerの名前は、日本のWeb文化やキャラクター画像、アバター、ステッカー、ミームで使われる、ぷるぷるした揺れ表現から来ています。このツールはその表現に着想を得た、独立したブラウザベースの編集ツールです。"],
          ["主な機能", "PNG、JPEG、WebP画像をアップロードし、動かしたい部分にモーションマスクを描き、強さやタイミングを調整してリアルタイムで確認できます。完成したアニメーションはMP4またはGIFとして書き出せます。"],
          ["基本の流れ", "土台になる部分は安定させたまま、髪、リボン、袖、耳、ステッカー、小物などの柔らかい部分を塗り、自然に弾むようにモーションを調整します。"],
        ],
      },
      "how-to-use-purupuru-maker": {
        title: "purupuru makerの使い方",
        description:
          "purupuru makerを使うと、静止画をブラウザ上でぷるぷる風の揺れアニメーションにできます。",
        sections: [
          ["1. 画像をアップロード", "エディター画面でPNG、JPEG、WebP画像をアップロードします。キャラクター画像、ステッカー、アバターなど、柔らかく動かしたい部分がはっきりしている画像に向いています。"],
          ["2. ブラシの太さを選ぶ", "ブラシサイズでストロークの太さを調整します。細いブラシは輪郭の調整に向き、太いブラシは髪や服など広い範囲を素早く塗るときに便利です。"],
          ["3. 動かす範囲を塗る", "Paintモードで髪、袖、リボン、耳、小物など、揺らしたい部分を塗ります。塗っていない部分は比較的安定したままになります。"],
          ["4. 揺れを調整", "PreviewモードでStrength、Speed、Spring、Damping、Motion over timeを調整します。Loopは一定の揺れ、Settleは揺れをだんだん静止へ戻す動き、Customは秒数ごとにWobble %を指定するキーフレームです。"],
          ["5. アニメーションを書き出す", "プレビューが自然に見えたら、MP4またはGIFとして書き出します。ブラウザのCanvas録画はChrome、Edge、Safariで比較的安定して動作します。"],
        ],
      },
      "are-my-images-uploaded": {
        title: "画像はアップロードされますか？",
        description:
          "purupuru makerでは、画像の読み込み、マスク描画、プレビュー、書き出しはブラウザ内でローカルに処理されます。",
        sections: [
          ["短い答え", "いいえ。エディターは、画像の読み込み、モーションマスクの描画、揺れのプレビュー、MP4またはGIFの書き出しをブラウザ内で処理する設計です。"],
          ["ローカルに残るもの", "選択した画像ファイル、描いたマスク、プレビューCanvas、書き出したメディアは、お使いの端末上のブラウザAPIで扱われます。アプリのコードが画像内容をpurupuru makerのサーバーへ送信することはありません。"],
          ["通常のWebアクセスで発生する情報", "多くのWebサイトと同じように、ホスティング層ではIPアドレス、ユーザーエージェント、アクセスURL、時刻などの標準的なリクエスト情報を受け取る場合があります。その通信に、編集している画像の内容は含まれません。"],
        ],
      },
    },
  },
  ko: {
    htmlLang: "ko",
    label: "한국어",
    homeTitle: "purupuru maker - 무료 이미지 흔들림 메이커",
    homeDescription:
      "purupuru maker는 이미지를 업로드하고 움직일 영역을 칠한 뒤 젤리처럼 부드러운 흔들림을 미리 보고 MP4 또는 GIF로 내보내는 무료 브라우저 도구입니다.",
    kicker: "브라우저 기반 이미지 흔들림 애니메이션",
    heroTitle: "purupuru maker: 무료 이미지 흔들림 메이커",
    heroBody:
      "purupuru maker에서는 일러스트를 업로드하고 움직일 부분을 칠한 뒤 부드러운 젤리 모션을 미리 보고 짧은 MP4 또는 GIF 애니메이션으로 내보낼 수 있습니다. 작업하는 동안 이미지는 브라우저 안에 머뭅니다.",
    howTitle: "작동 방식",
    steps: [
      ["PNG, JPEG 또는 WebP 이미지 업로드", "브라우저 안에서 이미지를 열고 모션 미리보기를 위한 유연한 메시를 준비합니다."],
      ["모션 마스크 칠하기", "머리카락, 옷, 스티커, 아바타 등 튀듯이 움직일 디테일을 브러시로 칠합니다."],
      ["미리보기 및 내보내기", "세기, 속도, Spring, Damping, Motion over time을 조정한 뒤 MP4 또는 GIF로 내보냅니다."],
    ],
    featuresTitle: "purupuru maker 기능",
    featuresBody:
      "데스크톱 소프트웨어를 설치하거나 작업물을 원격 편집기에 업로드하지 않고 빠르게 이미지를 애니메이션으로 만들고 싶은 크리에이터를 위한 도구입니다.",
    features: [
      "개인적인 이미지 편집을 위한 로컬 브라우저 처리",
      "선택적인 wobble 효과를 위한 브러시 기반 모션 마스킹",
      "WebGL 메시 변형 기반 실시간 미리보기",
      "세기, 속도, Spring, Damping, Motion over time 조정",
      "소셜 클립, 스티커, 밈, 아바타용 MP4/GIF 내보내기",
    ],
    faqTitle: "FAQ",
    resourcesTitle: "도움말",
    independent: "purupuru maker는 독립적인 브라우저 도구입니다.",
    privacy: "개인정보",
    terms: "이용약관",
    nav: {
      start: "시작",
      faq: "FAQ",
      terms: "약관",
      what: "purupuru maker란?",
      how: "purupuru maker 사용 방법",
      images: "이미지가 업로드되나요?",
    },
    pages: {
      "what-is-purupuru-maker": {
        title: "purupuru maker란?",
        description:
          "purupuru maker는 정지 이미지를 부드러운 젤리 느낌의 흔들림 애니메이션으로 만들 수 있는 무료 브라우저 기반 이미지 wobble 도구입니다.",
        sections: [
          ["아이디어의 출처", "purupuru maker라는 이름은 캐릭터 아트, 아바타, 스티커, 밈 등에서 쓰이는 말랑한 purupuru 스타일 흔들림 효과에서 왔습니다. purupuru maker는 그 표현에서 영감을 받은 독립적인 브라우저 기반 도구입니다."],
          ["주요 기능", "PNG, JPEG, WebP 이미지를 업로드하고 움직일 영역에 모션 마스크를 칠한 뒤, 흔들림의 세기와 타이밍을 조정해 실시간으로 미리 볼 수 있습니다. 결과는 짧은 MP4 또는 GIF 애니메이션으로 내보낼 수 있습니다."],
          ["기본 작업 흐름", "이미지의 중심이 되는 부분은 안정적으로 두고, 머리카락, 리본, 소매, 귀, 스티커, 액세서리처럼 부드럽게 움직일 디테일을 칠한 뒤 자연스럽게 튀는 느낌이 나도록 모션을 조정합니다."],
        ],
      },
      "how-to-use-purupuru-maker": {
        title: "purupuru maker 사용 방법",
        description:
          "purupuru maker를 사용하면 정지 이미지를 브라우저에서 purupuru 스타일의 흔들림 애니메이션으로 만들 수 있습니다.",
        sections: [
          ["1. 이미지 업로드", "에디터 화면에서 PNG, JPEG 또는 WebP 이미지를 업로드하세요. 캐릭터 아트, 스티커, 아바타처럼 움직일 부위가 분명한 이미지가 잘 어울립니다."],
          ["2. 브러시 두께 선택", "브러시 크기로 칠할 선의 폭을 정합니다. 얇은 브러시는 가장자리를 정교하게 다듬을 때 좋고, 두꺼운 브러시는 머리카락이나 옷처럼 넓은 영역을 빠르게 칠할 때 좋습니다."],
          ["3. 움직일 영역 칠하기", "Paint 모드에서 머리카락, 소매, 리본, 귀, 액세서리처럼 흔들리게 만들고 싶은 부분을 칠합니다. 칠하지 않은 영역은 더 안정적으로 유지됩니다."],
          ["4. 흔들림 조정", "Preview 모드에서 Strength, Speed, Spring, Damping, Motion over time을 조정합니다. Loop는 일정한 흔들림, Settle은 흔들림이 점점 멈추는 움직임, Custom은 특정 초마다 Wobble %를 지정하는 키프레임입니다."],
          ["5. 애니메이션 내보내기", "미리보기 결과가 마음에 들면 MP4 또는 GIF로 내보내세요. 브라우저 Canvas 녹화는 Chrome, Edge, Safari에서 대체로 가장 안정적입니다."],
        ],
      },
      "are-my-images-uploaded": {
        title: "이미지가 업로드되나요?",
        description:
          "purupuru maker는 이미지 불러오기, 마스크 칠하기, 미리보기, 내보내기를 브라우저 안에서 로컬로 처리합니다.",
        sections: [
          ["짧은 답변", "아니요. 에디터는 이미지 불러오기, 모션 마스크 칠하기, wobble 미리보기, MP4 또는 GIF 내보내기를 브라우저 안에서 처리하도록 설계되어 있습니다."],
          ["로컬에 남는 것", "선택한 이미지 파일, 칠한 마스크, 미리보기 Canvas, 내보낸 미디어는 기기의 브라우저 API로 처리됩니다. 앱 코드가 이미지 내용을 purupuru maker 서버로 보내지 않습니다."],
          ["일반적인 웹 요청 정보", "대부분의 웹사이트처럼 호스팅 계층은 IP 주소, 사용자 에이전트, 요청 URL, 요청 시간 같은 표준 요청 정보를 받을 수 있습니다. 이 기술적인 트래픽에는 편집 중인 이미지 내용이 포함되지 않습니다."],
        ],
      },
    },
  },
  "zh-Hant": {
    htmlLang: "zh-Hant",
    label: "繁體中文",
    homeTitle: "purupuru maker - 免費圖片晃動製作工具",
    homeDescription:
      "purupuru maker 是免費的瀏覽器圖片晃動工具，可上傳圖片、繪製可動區域、預覽柔軟晃動，並在本機匯出 MP4 或 GIF。",
    kicker: "瀏覽器圖片晃動動畫",
    heroTitle: "purupuru maker：免費圖片晃動製作工具",
    heroBody:
      "purupuru maker 可讓你上傳插圖、塗抹要移動的部分、預覽柔軟的果凍感動作，並匯出短版 MP4 或 GIF 動畫。編輯過程中，圖片會留在你的瀏覽器中。",
    howTitle: "使用方式",
    steps: [
      ["上傳 PNG、JPEG 或 WebP 圖片", "圖片會在瀏覽器中開啟，並準備用於動作預覽的彈性網格。"],
      ["繪製動作遮罩", "用筆刷塗抹頭髮、衣物、貼圖、頭像或其他需要彈動的細節。"],
      ["預覽並匯出", "調整強度、速度、Spring、Damping 與 Motion over time，然後直接從 Canvas 匯出 MP4 或 GIF。"],
    ],
    featuresTitle: "purupuru maker 功能",
    featuresBody:
      "這款工具適合想快速把圖片做成動畫、又不想安裝桌面軟體或把作品上傳到遠端編輯器的創作者。",
    features: [
      "在瀏覽器中本機處理，適合私密圖片編輯",
      "以筆刷繪製動作遮罩，選擇性套用晃動效果",
      "透過 WebGL 網格變形即時預覽",
      "可調整彈性、速度、Spring、Damping 與 Motion over time",
      "可為社群短片、貼圖、迷因與頭像匯出 MP4/GIF",
    ],
    faqTitle: "FAQ",
    resourcesTitle: "相關資源",
    independent: "purupuru maker 是一款獨立的瀏覽器工具。",
    privacy: "隱私權",
    terms: "服務條款",
    nav: {
      start: "開始",
      faq: "FAQ",
      terms: "條款",
      what: "purupuru maker 是什麼？",
      how: "如何使用 purupuru maker？",
      images: "我的圖片會被上傳嗎？",
    },
    pages: {
      "what-is-purupuru-maker": {
        title: "purupuru maker 是什麼？",
        description:
          "purupuru maker 是一款免費的瀏覽器圖片晃動工具，可以把靜態圖片做成柔軟的 purupuru 風格動畫。",
        sections: [
          ["名稱來源", "這個名稱來自常見於日本網路文化、角色圖、頭像、貼圖與迷因中的 purupuru 風格晃動效果。purupuru maker 是一款受這種效果啟發的獨立瀏覽器工具。"],
          ["主要功能", "purupuru maker 可讓你上傳 PNG、JPEG 或 WebP 圖片，繪製要晃動的動作遮罩，調整晃動強度與時間，即時預覽結果，並匯出短版 MP4 或 GIF 動畫。"],
          ["基本流程", "保留圖片中需要穩定的基底，只在頭髮、緞帶、袖子、耳朵、貼圖或配件等柔軟細節上繪製遮罩，再調整動作，讓畫面有彈性但不過度變形。"],
        ],
      },
      "how-to-use-purupuru-maker": {
        title: "如何使用 purupuru maker",
        description:
          "使用 purupuru maker，可以直接在瀏覽器中把靜態圖片變成 purupuru 風格的晃動動畫。",
        sections: [
          ["1. 上傳圖片", "在編輯器中上傳 PNG、JPEG 或 WebP 圖片。角色圖、貼圖、頭像，以及柔軟細節明確的圖片通常最適合。"],
          ["2. 選擇筆刷粗細", "使用筆刷大小控制筆觸寬度。較細的筆刷適合精修邊緣，較粗的筆刷則適合快速塗抹頭髮、衣服或其他大範圍區域。"],
          ["3. 繪製要晃動的區域", "在 Paint 模式中塗抹要晃動的部分，例如頭髮、袖子、緞帶、耳朵或配件。未塗抹的區域會保持較穩定。"],
          ["4. 調整晃動", "切換到 Preview 模式，調整 Strength、Speed、Spring、Damping 與 Motion over time。Loop 會保持固定晃動，Settle 會讓晃動逐漸回到靜止，Custom 可用關鍵影格在指定秒數設定 Wobble %。"],
          ["5. 匯出動畫", "預覽效果滿意後，可匯出為 MP4 影片或 GIF 動畫。Chrome、Edge 和 Safari 通常對瀏覽器 Canvas 錄製支援較穩定。"],
        ],
      },
      "are-my-images-uploaded": {
        title: "我的圖片會被上傳嗎？",
        description:
          "purupuru maker 的圖片載入、遮罩繪製、預覽與匯出都在你的瀏覽器中本機處理。",
        sections: [
          ["簡短回答", "不會。這個編輯器的設計是讓圖片載入、動作遮罩繪製、晃動預覽，以及 MP4 或 GIF 匯出都在瀏覽器中完成。"],
          ["哪些內容保留在本機", "你選擇的圖片檔、繪製的遮罩、預覽 Canvas 和匯出的媒體，都是由你裝置上的瀏覽器 API 處理。應用程式程式碼不會把圖片內容傳送到 purupuru maker 伺服器。"],
          ["網站請求仍可能包含的資訊", "和大多數網站一樣，主機服務可能會收到 IP 位址、使用者代理、請求網址與請求時間等標準請求資訊。這些技術流量不包含你正在編輯的圖片內容。"],
        ],
      },
    },
  },
};

for (const [locale, data] of Object.entries(locales)) {
  writeFile(`/${locale}/index.html`, homeHtml(locale, data));
  for (const [slug, page] of Object.entries(data.pages)) {
    writeFile(`/public/${locale}/${slug}/index.html`, infoHtml(locale, data, slug, page));
  }
}

function writeFile(relativePath, html) {
  const path = resolve(root, relativePath.slice(1));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
}

function homeHtml(locale, data) {
  const prefix = `/${locale}`;
  return `<!doctype html>
<html lang="${data.htmlLang}">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZQVGVQ05J5"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZQVGVQ05J5');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index,follow" />
    <meta name="application-name" content="purupuru maker" />
    <meta name="theme-color" content="#2ad3ad" />
    <meta name="description" content="${escapeAttr(data.homeDescription)}" />
    <link rel="canonical" href="${site}${prefix}/" />
    ${alternateLinks(prefix)}
    ${iconLinks()}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${site}${prefix}/" />
    <meta property="og:title" content="${escapeAttr(data.homeTitle)}" />
    <meta property="og:description" content="${escapeAttr(data.homeDescription)}" />
    <meta property="og:site_name" content="purupuru maker" />
    <meta property="og:image" content="${site}/purupurumaker-og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(data.homeTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(data.homeDescription)}" />
    <meta name="twitter:image" content="${site}/purupurumaker-og-image.png" />
    <title>${escapeHtml(data.homeTitle)}</title>
  </head>
  <body>
    <div id="root"></div>
    <footer class="seo-footer" aria-label="purupuru maker product information">
      <section class="seo-hero" aria-labelledby="seo-title">
        <div class="seo-inner">
          <p class="seo-kicker">${escapeHtml(data.kicker)}</p>
          <h1 id="seo-title">${escapeHtml(data.heroTitle)}</h1>
          <p>${escapeHtml(data.heroBody)}</p>
        </div>
      </section>
      <section class="seo-section" aria-labelledby="how-it-works-title">
        <div class="seo-inner">
          <h2 id="how-it-works-title">${escapeHtml(data.howTitle)}</h2>
          <div class="seo-grid">
            ${data.steps.map(([title, body]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`).join("\n")}
          </div>
        </div>
      </section>
      <section class="seo-section seo-split" aria-labelledby="features-title">
        <div class="seo-inner">
          <div>
            <h2 id="features-title">${escapeHtml(data.featuresTitle)}</h2>
            <p>${escapeHtml(data.featuresBody)}</p>
          </div>
          <ul class="seo-list">${data.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </section>
      <section class="seo-section" aria-labelledby="resources-title">
        <div class="seo-inner">
          <h2 id="resources-title">${escapeHtml(data.resourcesTitle)}</h2>
          <ul class="seo-link-list">
            <li><a href="${prefix}/what-is-purupuru-maker/">${escapeHtml(data.nav.what)}</a></li>
            <li><a href="${prefix}/how-to-use-purupuru-maker/">${escapeHtml(data.nav.how)}</a></li>
            <li><a href="${prefix}/are-my-images-uploaded/">${escapeHtml(data.nav.images)}</a></li>
          </ul>
        </div>
      </section>
      <div class="legal-footer">
        <span>${escapeHtml(data.independent)}</span>
        <nav aria-label="Legal links">
          <a href="/privacy.html">${escapeHtml(data.privacy)}</a>
          <a href="/terms.html">${escapeHtml(data.terms)}</a>
        </nav>
      </div>
    </footer>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function infoHtml(locale, data, slug, page) {
  const prefix = `/${locale}`;
  const url = `${site}${prefix}/${slug}/`;
  return `<!doctype html>
<html lang="${data.htmlLang}">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZQVGVQ05J5"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZQVGVQ05J5');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index,follow" />
    <meta name="theme-color" content="#2ad3ad" />
    <meta name="description" content="${escapeAttr(page.description)}" />
    <link rel="canonical" href="${url}" />
    ${alternateLinks(`${prefix}/${slug}`)}
    ${iconLinks()}
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:image" content="${site}/purupurumaker-og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" />
    <meta name="twitter:description" content="${escapeAttr(page.description)}" />
    <meta name="twitter:image" content="${site}/purupurumaker-og-image.png" />
    <title>${escapeHtml(page.title)} - purupuru maker FAQ</title>
    <style>${infoCss()}</style>
  </head>
  <body>
    ${infoHeader(locale, data)}
    <main>
      <h1>${escapeHtml(page.title)}</h1>
      <p>${escapeHtml(page.description)}</p>
      ${page.sections.map(([title, body]) => `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p>`).join("\n")}
    </main>
  </body>
</html>
`;
}

function infoHeader(locale, data) {
  const prefix = `/${locale}`;
  return `<header class="page-header"><nav class="page-nav" aria-label="Primary navigation"><a class="page-brand" href="${prefix}/" aria-label="purupuru maker start"><img class="page-brand-mark" src="/purupurumaker-wobble-maker-icon.png" alt="purupuru maker wobble maker icon" /><span>purupuru maker</span></a><div class="page-links"><a href="${prefix}/">${escapeHtml(data.nav.start)}</a><div class="page-dropdown"><button class="active" type="button" aria-haspopup="true">${escapeHtml(data.nav.faq)}</button><div class="page-menu" role="menu"><a href="${prefix}/what-is-purupuru-maker/" role="menuitem">${escapeHtml(data.nav.what)}</a><a href="${prefix}/how-to-use-purupuru-maker/" role="menuitem">${escapeHtml(data.nav.how)}</a><a href="${prefix}/are-my-images-uploaded/" role="menuitem">${escapeHtml(data.nav.images)}</a></div></div><div class="page-dropdown"><button type="button" aria-haspopup="true">${escapeHtml(data.nav.terms)}</button><div class="page-menu" role="menu"><a href="/terms.html" role="menuitem">${escapeHtml(data.terms)}</a><a href="/privacy.html" role="menuitem">${escapeHtml(data.privacy)}</a></div></div></div></nav></header>`;
}

function alternateLinks(path) {
  const normalized = path.endsWith("/") ? path.slice(0, -1) : path;
  const basePath = normalized.replace(/^\/(ja|ko|zh-Hant)/, "") || "";
  return [
    `<link rel="alternate" hreflang="en" href="${site}${basePath}/" />`,
    `<link rel="alternate" hreflang="ja" href="${site}/ja${basePath}/" />`,
    `<link rel="alternate" hreflang="ko" href="${site}/ko${basePath}/" />`,
    `<link rel="alternate" hreflang="zh-Hant" href="${site}/zh-Hant${basePath}/" />`,
    `<link rel="alternate" hreflang="x-default" href="${site}${basePath}/" />`,
  ].join("\n    ");
}

function iconLinks() {
  return `<link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="manifest" href="/site.webmanifest" />`;
}

function infoCss() {
  return `:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#111414;color:#edf4f1}body{margin:0;background:linear-gradient(180deg,rgba(255,255,255,.03),transparent 34%),#111414;color:#edf4f1}main{width:min(820px,calc(100% - 40px));margin:0 auto;padding:56px 0}a{color:#2ad3ad;font-weight:700}.page-header{background:#111414;border-bottom:1px solid rgba(255,255,255,.09)}.page-nav{display:grid;grid-template-columns:auto minmax(260px,1fr) auto;align-items:center;gap:8px;width:100%;min-height:68px;margin:0;padding:0 18px;box-sizing:border-box}.page-brand{grid-column:1;display:inline-flex;align-items:center;gap:12px;padding:0;color:#edf4f1!important;font-size:18px;font-weight:760;text-decoration:none}.page-brand-mark{display:block;width:40px;height:40px;border-radius:8px;object-fit:contain}.page-links{grid-column:2;justify-self:start;display:flex;align-items:center;gap:6px;margin-left:clamp(48px,8vw,126px)}.page-nav a,.page-nav button{display:inline-flex;align-items:center;min-height:36px;border:0;border-radius:8px;padding:0 12px;background:transparent;color:#dce9e5;font:inherit;font-size:14px;font-weight:700;text-decoration:none;white-space:nowrap}.page-nav button{cursor:pointer}.page-nav a:hover,.page-dropdown:hover>button,.page-dropdown:focus-within>button,.page-nav .active{background:rgba(255,255,255,.14);color:#fff}.page-dropdown{position:relative}.page-menu{position:absolute;top:calc(100% + 8px);left:0;z-index:10;display:grid;min-width:230px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:#161b1b;box-shadow:0 18px 50px rgba(0,0,0,.32);opacity:0;pointer-events:none;transform:translateY(-4px)}.page-dropdown:hover .page-menu,.page-dropdown:focus-within .page-menu{opacity:1;pointer-events:auto;transform:translateY(0)}.page-menu a{color:#cfe2dc;white-space:normal}h1{margin:0 0 18px;color:#edf4f1;font-size:42px;letter-spacing:0}h2{margin:34px 0 10px;color:#edf4f1;font-size:22px;letter-spacing:0}p,li{color:#b5c5c0;line-height:1.7}@media (max-width:900px){.page-nav{display:flex;align-items:flex-start;flex-direction:column;padding:12px}.page-links{margin-left:0;flex-wrap:wrap}main{width:min(100% - 28px,680px);padding:42px 0 54px}h1{font-size:34px}}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
