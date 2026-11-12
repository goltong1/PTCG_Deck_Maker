const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function tutorialSteps(language = 'ko', hasCards = false) {
  const L = (ko, en) => language === 'ko' ? ko : en;
  const step = (id, chapter, area, target, title, paragraphs, tip = '', reveal = '') => ({id, chapter, area, target, title, paragraphs, tip, reveal});
  const prep=L('덱 준비','Set up'), find=L('카드 찾기','Find cards'), edit=L('덱 편집','Edit'), output=L('저장·출력','Save & export'), settings=L('화면 설정','Display');
  return [
    step('new',prep,'deck','[data-action="new"]',L('새 덱으로 시작하기','Start a new deck'),[
      L('강조된 「새 덱」을 누르면 빈 덱이 하나 더 만들어집니다. 기존 덱은 「내 덱」에 남아 있어요.','Choose New deck to create another empty deck. Your existing decks remain in My decks.'),
      L('이 안내는 실제 버튼의 위치를 짚어 줍니다. 「다음」으로 이동하거나 아래 단계 목록에서 필요한 사용법만 골라 보세요.','This guide highlights the real controls. Use Next or choose a topic from the step list.')
    ],L('안내를 보는 동안 카드와 저장된 덱은 변경되지 않아요.','The guide does not change cards or saved decks.')),
    step('name',prep,'deck','#deckName',L('덱 이름 바꾸기','Name your deck'),[
      L('덱 제목을 클릭하고 원하는 이름을 입력하세요. 입력한 이름과 카드 구성은 이 브라우저에 자동 저장됩니다.','Click the deck title and type a name. The name and card list are saved automatically in this browser.'),
      L('기기를 바꾸거나 브라우저 데이터를 지우기 전에는 JSON 백업을 저장해 주세요.','Save a JSON backup before changing devices or clearing browser data.')
    ]),
    step('format',prep,'deck','.deck-description',L('대회 형식과 목표 장수 선택','Choose the format and card target'),[
      L('「스탠다드 · 한국」과 「익스팬디드 · BW+」 중 하나를 선택하면 카드 사용 가능 여부와 덱 검사 기준이 바뀝니다.','Choose Standard · Korea or Expanded · BW+ to change card eligibility and deck checks.'),
      L('옆의 40장은 연습용 편집 목표입니다. 두 대회 형식의 적법성 검사는 목표와 관계없이 60장을 요구합니다.','The 40-card option is a practice editing target. Both format checks still require exactly 60 cards.')
    ],L('익스팬디드는 일본 엑스트라 규정을 한국어판에 대응해 검사해요.','Expanded applies Japanese Extra rules to Korean card equivalents.')),
    step('search',find,'library','.search-box',L('이름·기술·효과로 검색','Search names, attacks and effects'),[
      L('검색창에 한국어 카드 이름, 기술명, 효과의 일부 또는 세트 코드를 입력하세요. 입력할 때마다 결과가 바뀝니다.','Enter a Korean card name, attack, effect text or set code. Results update as you type.'),
      L('단어를 띄어 쓰거나 쉼표로 나누면 모든 단어를 포함하는 카드를 찾습니다. 예: 「리자몽 ex」.','Separate words with spaces or commas to require every term. For example: “리자몽 ex”.')
    ],L('키보드 / 를 누르면 검색창으로 바로 이동합니다.','Press / to focus search.')),
    step('resize',find,'library','#libraryResizer, .library-head',L('카드 목록 넓게 보기','Make more room for cards'),[
      L('큰 화면에서는 카드 도감과 덱 사이의 세로 경계선을 좌우로 끌어 보세요. 도감을 넓히면 한 줄에 보이는 카드 수가 늘어납니다.','On a large screen, drag the vertical divider between the catalog and deck. A wider catalog shows more cards per row.'),
      L('너비는 다음 방문에도 유지됩니다. 경계선을 더블클릭하면 기본 너비로 돌아갑니다. 휴대폰에서는 카드 검색 탭이 화면 전체를 사용합니다.','The width is remembered. Double-click the divider to reset it. On a phone, the Find cards tab uses the full screen.')
    ],L('경계선에 포커스를 두고 ← / → 키로도 조절할 수 있어요.','Focus the divider and use the left/right arrow keys to resize.')),
    step('filters',find,'library','[data-action="toggle-filters"]',L('필터·정렬은 필요할 때만','Open filters when you need them'),[
      L('「필터·정렬」을 누르면 세부 분류·타입·세트·정렬 순서가 펼쳐집니다. 다시 누르면 접혀 카드 공간이 넓어져요.','Filter & sort expands subcategories, types, sets and sorting. Press it again to collapse the panel and make room for cards.'),
      L('패널을 접어도 선택한 조건은 유지되며 버튼에 적용된 조건 수가 표시됩니다. 「같은 이름 묶기」를 끄면 다른 그림과 판본도 모두 볼 수 있어요.','Your selections remain active when collapsed, with a count on the button. Turn off One per name to see alternate artwork and printings.')
    ]),
    step('categories',find,'library','.category-tabs',L('카드 종류부터 좁히기','Filter by card category'),[
      L('전체·포켓몬·트레이너스·에너지 버튼으로 큰 분류를 고르세요.','Choose All, Pokémon, Trainers or Energy.'),
      L('트레이너스를 고르면 아이템·서포트·도구·스타디움, 에너지를 고르면 기본·특수 에너지 조건을 「필터·정렬」에서 고를 수 있어요.','After choosing Trainers, use Filter & sort for Item, Supporter, Tool or Stadium. Energy offers Basic and Special Energy.')
    ]),
    step('chips',find,'library','.chips',L('세부 조건 버튼 사용하기','Use the quick filter buttons'),[
      L('Pokémon ex, 기본 포켓몬, ACE SPEC처럼 필요한 조건을 버튼 하나로 선택할 수 있어요. 표시되는 조건은 선택한 카드 종류에 따라 달라집니다.','Use quick buttons such as Pokémon ex, Basic Pokémon and ACE SPEC. Available filters depend on the selected category.'),
      L('선택한 버튼을 다시 누르면 해당 조건이 해제됩니다. 여러 필터를 함께 사용하면 결과가 더 좁아집니다.','Click the selected button again to turn it off. Combining filters narrows the results.')
    ]),
    step('types',find,'library','.type-buttons',L('타입 아이콘으로 찾기','Search with type icons'),[
      L('풀·불꽃·물 등 타입 아이콘을 누르면 해당 타입의 카드만 남습니다. 같은 아이콘을 한 번 더 누르면 해제돼요.','Click a Grass, Fire, Water or other type icon to filter cards. Click it again to clear the type.'),
      L('검색어와 카드 종류 필터도 함께 적용됩니다. 결과가 없으면 타입을 해제하거나 「초기화」를 눌러 보세요.','Search text and category filters still apply. If nothing matches, clear the type or use Reset.')
    ]),
    step('sets',find,'library','.filter-selects',L('원하는 수록 세트 선택','Choose a specific set'),[
      L('「모든 세트」 목록에서 확장팩이나 덱 상품을 선택하면 그 세트의 판본만 표시됩니다.','Select an expansion or deck product from All sets to show only that printing’s set.'),
      L('같은 이름의 카드라도 수록 번호·그림·레귤레이션 마크가 다를 수 있어요. 공식 레시피에 넣을 실제 판본을 골라 주세요.','Cards with the same name may have different numbers, art and regulation marks. Choose the printing you will actually submit.')
    ]),
    step('eligibility',find,'library','.format-scope',L('덱 형식에 맞는 카드만 표시','Match cards to your deck format'),[
      L('「스탠다드 카드만」을 켜면 현재 덱 형식에서 사용 가능으로 확인된 판본만 남습니다. 금지 카드와 확인이 필요한 카드는 제외됩니다.','Standard cards only keeps printings confirmed eligible for the current deck format. Banned cards and cards requiring review are excluded.'),
      L('덱을 익스팬디드로 바꾸면 이 옵션과 결과도 익스팬디드 기준으로 바뀝니다. 체크를 끄면 모든 형식을 볼 수 있어요. 검색 조건을 초기화해도 이 옵션은 유지됩니다.','Changing the deck to Expanded updates this option and its results automatically. Uncheck it to browse all formats. Reset search keeps this option unchanged.')
    ]),
    step('add',find,'library','.result-add, #results',L('카드 추가와 드래그 앤 드롭','Add cards or drag them onto the deck'),[
      L('검색 결과 카드의 + 버튼을 누를 때마다 현재 덱에 1장씩 추가됩니다. 카드 그림을 누르면 상세 정보를 볼 수 있어요.','Each press of a card’s + button adds one copy to the current deck. Click the card image to inspect it.'),
      L('큰 화면에서는 카드를 오른쪽 덱 캔버스의 아무 곳에나 끌어 놓으세요. 포켓몬·트레이너스·에너지가 자동으로 나뉩니다. 휴대폰에서는 + 버튼이 편해요.','On a large screen, drag a card anywhere onto the deck canvas. Pokémon, Trainers and Energy sort automatically. On a phone, use +.')
    ],L('카드를 추가해도 선택한 검색 조건은 유지됩니다.','Adding cards keeps your search filters.')),
    step('detail',find,'library','#dialog .detail-add',L('판본과 효과 자세히 보기','Inspect a card and its printing'),[
      L('실제 카드 상세 창입니다. HP·타입·기술·효과와 세트·번호를 확인하고 「덱에 추가」를 누르면 1장이 추가됩니다.','This is the actual card detail window. Review HP, type, attacks, effects, set and number; Add to deck adds one copy.'),
      L('사용 가능 여부와 사유도 이곳에 표시됩니다. 카드 정보가 의심되면 아래 「공식 카드 페이지에서 확인」 링크로 원문을 확인하세요.','Eligibility and its reason appear here too. Use View official card page to verify the original card information.')
    ],'', 'detail'),
    step('quantities',edit,'deck',hasCards?'.deck-card .quantity':'#canvas',L('덱 안에서 장수 조절하기','Adjust quantities in your deck'),[
      hasCards?L('강조된 − / + 버튼으로 해당 판본의 장수를 1장씩 줄이거나 늘릴 수 있어요. 1장에서 −를 누르면 그 카드가 덱에서 빠집니다.','Use the highlighted − / + buttons to remove or add one copy of that printing. Removing the last copy removes the card.'):L('지금은 덱이 비어 있습니다. 카드를 넣으면 각 카드 아래에 − / +와 현재 장수가 표시됩니다. −는 1장 제거, +는 1장 추가예요.','Your deck is empty. After adding a card, − / + and the quantity appear below it. − removes one copy; + adds one.'),
      L('위쪽의 포켓몬·트레이너스·에너지 합계와 전체 장수도 바로 갱신됩니다.','The Pokémon, Trainer, Energy and total counts update immediately.')
    ]),
    step('editing',edit,'deck','.board-actions',L('실행 취소·목록 보기·정렬','Undo, switch views and sort'),[
      L('왼쪽 화살표는 실행 취소, 오른쪽 화살표는 다시 실행입니다. 카드 추가·제거·장수 변경을 되돌릴 수 있어요.','The left arrow undoes and the right arrow redoes. They restore card additions, removals and quantity changes.'),
      L('격자/목록 버튼은 카드 이미지 보기와 텍스트 목록 보기를 바꿉니다. 「정렬」은 각 카드 종류 안에서 이름순으로 정리합니다.','Grid/List switches between card images and a text list. Sort orders cards by name within their categories.')
    ],L('Ctrl/Cmd+Z: 실행 취소 · Ctrl/Cmd+Shift+Z: 다시 실행','Ctrl/Cmd+Z: undo · Ctrl/Cmd+Shift+Z: redo')),
    step('remove',edit,'deck','#trash',L('카드 제거와 덱 비우기','Remove cards or clear the deck'),[
      L('덱에 있는 카드를 이 휴지통 영역에 끌어 놓으면 1장만 제거됩니다. 검색 결과 카드를 끌어 놓아도 덱은 바뀌지 않아요.','Drag a card from the deck to this trash area to remove one copy. Dropping a search result here does not change the deck.'),
      L('「비우기」는 확인 창을 거쳐 현재 덱의 카드 전체를 제거합니다. 실수했다면 실행 취소로 되돌릴 수 있어요.','Clear asks for confirmation before removing every card from the current deck. Undo can restore it.')
    ]),
    step('legality',edit,'deck','#validation .checks-head',L('적법성 검사 읽기','Read the legality checks'),[
      L('검사 줄을 누르면 총 60장, 동명 카드 제한, 기본 포켓몬, ACE SPEC 등 세부 항목이 펼쳐집니다.','Click the check bar to expand checks for 60 cards, name limits, Basic Pokémon, ACE SPEC and other rules.'),
      L('「부적법」이면 실패한 항목과 카드를 확인하세요. 「확인 필요」는 판정을 확정할 데이터가 부족하다는 뜻입니다. 위반 카드명을 누르면 상세 창이 열립니다.','For Not legal, review the failed checks and cards. Review required means the data is insufficient for a verdict. Click a flagged card to inspect it.')
    ],L('이 화면의 규정 출처와 확인일도 함께 확인하세요.','Check the rule source and review date shown here.'),'validation'),
    step('decks',output,'deck','#dialog .saved-deck',L('여러 덱 관리하기','Manage saved decks'),[
      L('「내 덱」에서 저장된 덱을 열거나 복제할 수 있습니다. 복제하면 원본을 남긴 채 다른 구성을 시험할 수 있어요.','My decks lets you open or duplicate a saved deck. Duplicate keeps the original while you try a different build.'),
      L('이 목록의 휴지통 버튼은 저장된 덱 자체를 삭제합니다. 캔버스의 「비우기」와 달리 복구할 수 없으므로 필요한 덱은 먼저 JSON으로 백업하세요.','The trash button in this list deletes the saved deck itself. Unlike Clear on the canvas, this cannot be undone; back up important decks as JSON first.')
    ],'', 'decks'),
    step('import',output,'deck','#importText',L('텍스트·JSON 덱 가져오기','Import a text list or JSON backup'),[
      L('「가져오기」에서 파일을 선택하거나 목록을 붙여 넣고 「목록 확인」을 누르세요. 예: 「4 드라꼰 (SV6 079)」.','Choose a file or paste a list in Import, then press Check list. Example: “4 드라꼰 (SV6 079)”.'),
      L('모르는 카드명이나 잘못된 장수는 먼저 수정해야 합니다. 확인 후 「새 덱으로 가져오기」를 누르면 기존 덱을 보존하고 새 덱이 추가돼요.','Correct unknown names or invalid quantities first. Import as new deck then adds another deck while keeping the existing one.')
    ],L('JSON은 카드 판본·덱 형식·출력 정보를 함께 복원합니다.','JSON restores printings, format and sheet profile together.'),'import'),
    step('recipe',output,'deck','#dialog .recipe-profile',L('공식 레시피의 이름·부문 입력','Fill in the official sheet profile'),[
      L('「공식 레시피」에서 플레이어 이름과 참가 부문을 입력하세요. 비워 두면 출력 후 직접 기입할 수 있습니다.','Enter the player name and division in Official deck sheet. Leave them blank to fill in by hand.'),
      L('미리보기에는 카드명·장수와 포켓몬의 시리즈 마크·컬렉션 넘버가 채워집니다. 참가 부문의 연령 기준은 첨부된 2026 양식 기준입니다.','The preview fills names, quantities, and Pokémon series marks and collection numbers. Division ages follow the supplied 2026 form.')
    ],'', 'recipe'),
    step('download',output,'deck','#dialog .dialog-actions',L('엑셀 저장과 인쇄 / PDF','Download Excel or print to PDF'),[
      L('「엑셀(.xlsx) 저장」은 원본 양식의 병합·스타일·인쇄 설정을 유지한 파일을 받습니다. 「공식 양식 인쇄 / PDF」는 브라우저 인쇄 창을 엽니다.','Download .xlsx preserves the original form’s merges, styles and print settings. Print sheet / PDF opens your browser’s print dialog.'),
      L('초안도 출력할 수 있으니 제출 전 적법성 검사와 총 60장을 확인하세요. 양식의 행 수를 넘거나 카드 정보를 확정할 수 없는 경우에는 사유를 표시하고 출력을 막습니다.','Drafts can be exported, so check legality and the 60-card total before submitting. Exports are blocked with a reason if the form overflows or required card identifiers are unavailable.')
    ],L('빈 덱에서는 저장·인쇄 버튼이 비활성화됩니다.','Download and print are disabled for an empty deck.'),'recipe'),
    step('backup',output,'deck','#dialog .export-tabs',L('공유는 텍스트, 보관은 JSON','Share text; back up JSON'),[
      L('「텍스트 목록」은 복사해서 공유하기 좋습니다. 「JSON 백업」은 선택한 판본·장수·덱 형식·출력 정보를 그대로 저장합니다.','Text list is convenient for copying and sharing. JSON backup preserves the selected printings, quantities, format and sheet profile.'),
      L('이 창의 「파일 저장」으로 내려받은 JSON을 다른 기기에서 「가져오기」로 열면 이어서 편집할 수 있어요.','Use Download to save JSON, then Import it on another device to continue editing.')
    ],'', 'backup'),
    step('display',settings,'deck','.theme-toggle, .language',L('블랙 모드와 인터페이스 언어','Choose the theme and interface language'),[
      L('상단의 블랙/라이트 버튼으로 테마를 바꿉니다. KO / EN 버튼은 인터페이스와 이 튜토리얼의 언어를 바꿔요.','The Dark/Light button changes the theme. KO / EN changes the interface and this tutorial’s language.'),
      L('카드 이름과 이미지는 한국어판으로 유지됩니다. 다시 사용법을 보려면 언제든 ⓘ 버튼을 누르세요.','Card names and images remain Korean. Press ⓘ any time to reopen the guide.')
    ],L('「완료」를 누르면 안내를 시작하기 전 화면으로 돌아갑니다.','Done returns you to the view you started from.')),
  ];
}

// Deterministic placement keeps the bubble inside the viewport and prefers a
// side without covering the highlighted control. Narrow screens use a bottom sheet.
export function placeTutorial(anchor, viewport, panel) {
  const gap=18, edge=12, width=Math.min(panel.width,viewport.width-edge*2),height=Math.min(panel.height,viewport.height-edge*2);
  const clamp=(x,a,b)=>Math.max(a,Math.min(x,b));
  if(viewport.width<=720)return {left:edge,top:Math.max(edge,viewport.height-height-edge),side:'bottom'};
  const candidates=[
    {left:anchor.right+gap,top:anchor.top,side:'right'},
    {left:anchor.left-width-gap,top:anchor.top,side:'left'},
    {left:anchor.left,top:anchor.bottom+gap,side:'bottom'},
    {left:anchor.left,top:anchor.top-height-gap,side:'top'},
  ].map(p=>({...p,left:clamp(p.left,edge,viewport.width-width-edge),top:clamp(p.top,edge,viewport.height-height-edge)}));
  const overlap=p=>Math.max(0,Math.min(p.left+width,anchor.right)-Math.max(p.left,anchor.left))*Math.max(0,Math.min(p.top+height,anchor.bottom)-Math.max(p.top,anchor.top));
  return candidates.sort((a,b)=>overlap(a)-overlap(b))[0];
}

export function createTutorial({getLanguage,hasCards,capture,prepare,restore}) {
  let dialog,panel,steps=[],index=0,context,origin,active=false,frame=0,resizeObserver;
  const L=(ko,en)=>getLanguage()==='ko'?ko:en;
  const visible=el=>el&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none';
  function target(){
    for(const selector of steps[index].target.split(',')){
      const el=[...document.querySelectorAll(selector.trim())].find(visible);
      if(el)return el;
    }
    return document.querySelector('.topbar');
  }
  function clippedRect(el){
    let r=el.getBoundingClientRect(),left=Math.max(6,r.left-6),right=Math.min(innerWidth-6,r.right+6),top=Math.max(6,r.top-6),bottom=Math.min(innerHeight-6,r.bottom+6);
    for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const css=getComputedStyle(p),b=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(css.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom);}if(/auto|scroll|hidden|clip/.test(css.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right);}}
    return {left,top,right:Math.max(left+2,right),bottom:Math.max(top+2,bottom)};
  }
  function position(reveal=false){
    if(!active||!dialog.open)return;
    const el=target();if(!el)return;
    if(reveal){el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});}
    panel.style.width='';
    if(innerWidth>720){
      const initial=clippedRect(el),sideRoom=Math.max(initial.left-30,innerWidth-initial.right-30);
      if(initial.bottom-initial.top>100&&sideRoom>=280&&sideRoom<panel.offsetWidth)panel.style.width=sideRoom+'px';
    }
    const panelHeight=panel.getBoundingClientRect().height;
    if(innerWidth<=720&&reveal){
      const topLimit=document.querySelector('#dialog')?.open?20:120;
      const available=innerHeight-panelHeight-24-topLimit;
      let p=el.parentElement;
      while(p&&p!==document.body){if(/auto|scroll/.test(getComputedStyle(p).overflowY)&&p.scrollHeight>p.clientHeight){const r=el.getBoundingClientRect();p.scrollTop+=r.top-Math.max(topLimit,topLimit+(available-r.height)/2);break;}p=p.parentElement;}
    }
    const r=clippedRect(el),rect={x:r.left,y:r.top,width:r.right-r.left,height:r.bottom-r.top};
    dialog.querySelectorAll('[data-tour-cutout]').forEach(c=>{for(const [key,val] of Object.entries(rect))c.setAttribute(key,String(val));});
    const pos=placeTutorial(r,{width:innerWidth,height:innerHeight},{width:panel.offsetWidth,height:panel.offsetHeight});
    panel.style.left=pos.left+'px';panel.style.top=pos.top+'px';panel.dataset.side=pos.side;
    const notch=panel.querySelector('.tutorial-arrow');
    const axis=pos.side==='left'||pos.side==='right'?'top':'left';
    notch.style.removeProperty('left');notch.style.removeProperty('top');
    notch.style[axis]=Math.max(22,Math.min(axis==='top'?panel.offsetHeight-30:panel.offsetWidth-30,axis==='top'?(r.top+r.bottom)/2-pos.top:(r.left+r.right)/2-pos.left))+'px';
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>position());}
  function show(next){
    if(!active)return;index=Math.max(0,Math.min(next,steps.length-1));
    if(dialog.open)dialog.close();
    prepare(steps[index]);
    const s=steps[index];
    dialog.innerHTML=`<svg class="tutorial-shade" width="100%" height="100%" aria-hidden="true"><defs><mask id="tutorialMask"><rect width="100%" height="100%" fill="white"/><rect data-tour-cutout rx="8" fill="black"/></mask></defs><rect width="100%" height="100%" fill="rgba(3,6,12,.76)" mask="url(#tutorialMask)"/><rect data-tour-cutout class="tutorial-ring" rx="8" fill="none"/></svg><section class="tutorial-panel" aria-labelledby="tutorialTitle" aria-describedby="tutorialDescription"><span class="tutorial-arrow" aria-hidden="true"></span><div class="tutorial-heading"><span class="tutorial-kicker">${escapeHTML(L('사용 튜토리얼','HOW TO USE'))} <b>${index+1} / ${steps.length}</b></span><button type="button" class="tutorial-close" data-tour="close" aria-label="${L('튜토리얼 종료','Close tutorial')}">×</button></div><div class="tutorial-progress" aria-hidden="true"><span style="width:${(index+1)/steps.length*100}%"></span></div><div class="tutorial-chapter">${escapeHTML(s.chapter)}</div><h2 id="tutorialTitle" tabindex="-1">${escapeHTML(s.title)}</h2><div id="tutorialDescription">${s.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}${s.tip?`<p class="tutorial-tip">${escapeHTML(s.tip)}</p>`:''}</div><label class="tutorial-step-label" for="tutorialStep">${L('다른 단계로 이동','Jump to a step')}</label><select id="tutorialStep" aria-label="${L('튜토리얼 단계 선택','Tutorial step')}">${steps.map((st,i)=>`<option value="${i}" ${i===index?'selected':''}>${i+1}. ${escapeHTML(st.title)}</option>`).join('')}</select><div class="tutorial-navigation"><button type="button" class="tutorial-skip" data-tour="close">${L('안내 종료','Exit guide')}</button><div><button type="button" data-tour="previous" ${index===0?'disabled':''}>${L('이전','Back')}</button><button type="button" class="tutorial-next" data-tour="next">${index===steps.length-1?L('완료','Done'):L('다음','Next')} <span aria-hidden="true">→</span></button></div></div><p class="tutorial-keyboard">${L('← → 단계 이동 · Esc 종료','← → navigate · Esc close')}</p></section>`;
    panel=dialog.querySelector('.tutorial-panel');dialog.dataset.step=s.id;dialog.showModal();
    position(true);frame=requestAnimationFrame(()=>position());
    dialog.querySelector('#tutorialTitle').focus({preventScroll:true});
    resizeObserver?.disconnect();resizeObserver=new ResizeObserver(schedule);resizeObserver.observe(panel);
  }
  function stop(){
    if(!active)return;active=false;cancelAnimationFrame(frame);resizeObserver?.disconnect();dialog.close();dialog.remove();dialog=null;panel=null;
    window.removeEventListener('resize',schedule);document.removeEventListener('scroll',schedule,true);document.body.classList.remove('tutorial-open');
    restore(context);if(origin?.isConnected&&visible(origin))origin.focus({preventScroll:true});
  }
  function start(){
    if(active)return;origin=document.activeElement;context=capture();steps=tutorialSteps(getLanguage(),hasCards());active=true;
    dialog=document.createElement('dialog');dialog.id='tutorialOverlay';dialog.className='tutorial-overlay';dialog.setAttribute('aria-label',L('사용 튜토리얼','Usage tutorial'));document.body.append(dialog);document.body.classList.add('tutorial-open');
    dialog.addEventListener('cancel',e=>{e.preventDefault();stop();});
    dialog.addEventListener('click',e=>{e.stopPropagation();const action=e.target.closest('[data-tour]')?.dataset.tour;if(action==='close')stop();else if(action==='previous')show(index-1);else if(action==='next'){if(index===steps.length-1)stop();else show(index+1);}});
    dialog.addEventListener('change',e=>{if(e.target.id==='tutorialStep')show(Number(e.target.value));});
    dialog.addEventListener('keydown',e=>{
      e.stopPropagation();if(e.key==='Escape'){e.preventDefault();stop();return;}
      if(e.target.tagName==='SELECT')return;
      if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();if(e.key==='ArrowRight'&&index<steps.length-1)show(index+1);if(e.key==='ArrowLeft'&&index>0)show(index-1);}
    });
    window.addEventListener('resize',schedule);document.addEventListener('scroll',schedule,true);show(0);
  }
  return {start,stop,get active(){return active;}};
}
