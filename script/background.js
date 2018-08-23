whale.runtime.onInstalled.addListener(() => {
  whale.storage.sync.set({
    portalCache: Array(10).fill(''),
    cacheNum: 1,
    radioBtn: 1,
    majorUrl: 'http://cs.hanyang.ac.kr/board/info_board.php',
    notKeyword: '장학',
  });
  whale.storage.local.set({ nowAt: 0 });

  whale.notifications.onClicked.addListener((id) => {
    if (id === 'newMail') {
      whale.storage.local.set({ nowAt: 3 });
      whale.sidebarAction.show({
        url: whale.runtime.getURL('mail.html'),
        reload: true,
      });
    } else {
      whale.storage.local.set({ nowAt: 2 });
      whale.sidebarAction.show({
        url: whale.runtime.getURL('announce.html'),
        reload: true,
      });
    }
  });
  whale.sidebarAction.setBadgeBackgroundColor({
    color: '#ff0000',
  });
});

let currentMailsCnt = 0;

// contextMenus
function callCopyCurri() {
  whale.tabs.query({
    active: true,
    currentWindow: true,
  }, (tab) => {
    const myTab = tab[0].id;
    whale.tabs.sendMessage(myTab, 'curriTable', {}, (response) => {
      if (response === 'table-store-succeed') {
        whale.storage.local.set({ nowAt: 1 });
        whale.sidebarAction.show({
          url: whale.runtime.getURL('myinfo.html'),
          reload: true,
        });
      }
    });
  });
}
function callCopyGrad() {
  whale.tabs.query({
    active: true,
    currentWindow: true,
  }, (tab) => {
    const myTab = tab[0].id;
    whale.tabs.sendMessage(myTab, 'gradTable', {}, (response) => {
      if (response === 'table-store-succeed') {
        whale.storage.local.set({ nowAt: 1 });
        whale.sidebarAction.show({
          url: whale.runtime.getURL('myinfo.html'),
          reload: true,
        });
      }
    });
  });
}

// Cafeteria
function food() {
  function parseResult(id, html) {
    const dataToSave = {};

    const fragment = document.createElement('DIV');
    fragment.innerHTML = html;

    const ths = fragment.querySelectorAll('.foodView-view table th');
    ths.forEach((th) => {
      let value = '';
      const title = th.innerHTML;
      if (title.includes('운영시간')) {
        value = th.closest('tr').querySelector('td pre').innerHTML;
        dataToSave.mealTime = value;
      } else if (title.includes('식당명')) {
        value = th.closest('tr').querySelector('td').innerHTML;
        dataToSave.name = value;
      } else if (title.includes('위치')) {
        value = th.closest('tr').querySelector('td').innerHTML;
        dataToSave.location = value;
      }
    });
    const lis = fragment.querySelectorAll('#_foodView_WAR_foodportlet_tab_1 .thumbnails li');
    const menu = [];
    lis.forEach((li) => {
      const price = li.querySelector('.price');
      const img = li.querySelector('img');
      if (price && img) {
        menu.push({
          thumbnail: img.src,
          price: price.innerHTML,
          name: img.alt,
        });
      }
    });
    dataToSave.menus = menu;

    whale.storage.local.set({
      [id]: dataToSave,
    });
  }

  function fetchUrl(id) {
    fetch(`http://www.hanyang.ac.kr/web/www/${id}`)
      .then(result => result.text())
      .then(html => parseResult(id, html));
  }

  const pageIds = [
    '-248',
    '-249',
    '-250',
    '-251',
    '-252',
    '-253',
    '-1-',
    '-2-',
  ];

  whale.storage.local.set({
    idlist: pageIds,
  });
  pageIds.forEach(id => fetchUrl(id));
}

// Portal Notifications
moment.tz.add('Asia/Seoul|LMT KST JST KST KDT KDT|-8r.Q -8u -90 -90 -9u -a0|0123141414141414135353|-2um8r.Q 97XV.Q 1m1zu kKo0 2I0u OL0 1FB0 Rb0 1qN0 TX0 1tB0 TX0 1tB0 TX0 1tB0 TX0 2ap0 12FBu 11A0 1o00 11A0|23e6');

function portal() {
  const URL = 'https://portal.hanyang.ac.kr/GjshAct/viewRSS.do?gubun=rss';
  function bringPortalInfo(html) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');
    const $temp = document.createElement('DIV');
    const saveNoti = [];

    const newHTML = decoder.decode(encoder.encode(html));
    $temp.innerHTML = newHTML;
    const $items = $temp.querySelectorAll('item');

    let cache;
    let cachenum;
    let keyword = '장학';

    whale.storage.sync.get(['portalCache', 'cacheNum', 'notKeyword', 'radioBtn'], (result) => {
      if (result.portalCache) {
        cache = result.portalCache;
      }
      if (result.cacheNum) {
        cachenum = result.cacheNum;
      }
      if (result.notKeyword) {
        keyword = result.notKeyword;
      }

      for (let i = 0; i < 10; i += 1) {
        if (!($items[i].children[3].innerHTML.includes('ERICA'))
            && !($items[i].children[3].innerHTML.includes('연구'))) {
          // notification 만들기
          const title = $items[i].children[0].innerHTML;
          if (title.includes(keyword)) {
            const pushNot = {
              type: 'basic',
              title: `${keyword} 관련 공지가 올라왔습니다.`,
              message: title,
              iconUrl: '/image/003-idea.png',
            };
            // cache와 비교, 없는 것만 create
            if (cache) {
              if (!cache.includes(title) && result.radioBtn === 1) {
                if (cachenum > 10) {
                  cachenum = 0;
                }

                cache[cachenum] = title;

                whale.notifications.create(pushNot);
                whale.storage.sync.set({
                  portalCache: cache,
                  cacheNum: cachenum + 1,
                });
                cachenum += 1;
              }
            }
          }
          saveNoti.push({
            title,
            date: moment($items[i].children[2].innerHTML).tz('Asia/Seoul').format('YYYY-MM-DD'),
            link: $items[i].children[1].nextSibling.data,
          });
        }
      }

      whale.storage.sync.set({ portalNoti: saveNoti });
    });
  }
  fetch(URL)
    .then(result => result.text())
    .then(html => bringPortalInfo(html));
}

// Mail Notifications
function badge() {
  if (currentMailsCnt === 0) {
    whale.sidebarAction.setBadgeText({
      text: '',
    });
  } else {
    whale.sidebarAction.setBadgeText({
      text: `${currentMailsCnt}`,
    });
  }
}
function mailNoti() {
  function pushMailNoti(html) {
    const $mailbox = document.createElement('SECTION');
    $mailbox.innerHTML = html;
    const $em = $mailbox.querySelector('em');
    if (!$em) {
      return;
    }
    const count = parseInt($em.innerText, 10);
    if (count > currentMailsCnt) {
      // notification
      const not = {
        type: 'basic',
        iconUrl: '/image/004-email.png',
        title: '새 메일이 도착하였습니다.',
        message: '한양대학교',
      };
      whale.notifications.create('newMail', not, () => {});
      whale.notifications.clear('newMail');
    }
    $mailbox.remove();
    currentMailsCnt = count;
    badge();
  }

  const URL = 'http://mail.hanyang.ac.kr/mobile/mobileMailList.ds?act=list';
  fetch(URL, {
    credentials: 'include',
  })
    .then(result => result.text())
    .then(html => pushMailNoti(html));
}

function execution() {
  let a = 0;

  food();
  portal();
  mailNoti();
  setInterval(() => {
    food();
    portal();
  }, 1000 * 60 * 60);

  setInterval(() => {
    a = Math.floor(Math.random() * 60);
    mailNoti();
  }, 1000 * (60 * 5 + a));
}

execution();

whale.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'food') {
    food();
  } else if (message === 'mail') {
    mailNoti();
  } else if (message === 'validMenuCurri') {
    whale.contextMenus.create({
      type: 'normal',
      title: '내 교육과정 저장하기',
      documentUrlPatterns: ['*://portal.hanyang.ac.kr/*'],
      onclick: callCopyCurri,
    }, () => {});
  } else if (message === 'validMenuGrad') {
    whale.contextMenus.create({
      type: 'normal',
      title: '내 졸업사정 저장하기',
      documentUrlPatterns: ['*://portal.hanyang.ac.kr/*'],
      onclick: callCopyGrad,
    }, () => {});
  } else if (message === 'removeMenus') {
    whale.contextMenus.removeAll();
  }
  sendResponse();
});
