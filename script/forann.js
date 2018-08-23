(function ann() {
  const majors = [
    ['건축학부', 'http://architecture.hanyang.ac.kr/notice_normal'],
    ['건축공학부', 'http://are.hanyang.ac.kr/kor/community_0201.html?PHPSESSID=09c542263f33d8bcf5cdc2ad9514822a'],
    ['건설환경공학과', 'http://civil.hanyang.ac.kr/kor/community_0201.html?PHPSESSID=8b4a73ba22212d6156dcfea9a1ca90de'],
    ['도시공학과', 'http://hyurban.hanyang.ac.kr/?module=Board&action=SiteBoard&sMode=SELECT_FORM&iBrdNo=9'],
    ['자원환경공학과', 'http://eree.hanyang.ac.kr/index.php?hCode=BOARD&bo_idx=21'],
    ['융합전자공학부', 'http://electronic.hanyang.ac.kr/notice/list_hi.php'],
    ['정보시스템학과', 'http://is.hanyang.ac.kr/?page=45'],
    ['신소재공학부', 'http://mse.hanyang.ac.kr/notice/list.php'],
    ['유기나노공학과', 'http://one.hanyang.ac.kr/bbs/board.php?bo_table=notice'],
    ['기계공학부', 'http://me.hanyang.ac.kr/ko/cmnt/mann/views/findCmntList.do'],
    ['원자력공학과', 'http://nuclear.hanyang.ac.kr/index.php?hCode=BOARD&bo_idx=1'],
    ['산업공학과', 'http://ie.hanyang.ac.kr/page/s501.php'],
    ['에너지공학과', 'http://energy.hanyang.ac.kr/modules/board/bd_list.html?id=notice&mc_code=1610'],
    ['미래자동차공학과', 'http://ae.hanyang.ac.kr/index/asset/board_notice1.php'],
    ['컴퓨터소프트웨어학부', 'http://cs.hanyang.ac.kr/board/info_board.php'],
    ['전기공학전공', 'http://ebe.hanyang.ac.kr/'],
    ['생체공학전공', 'http://bme.hanyang.ac.kr/'],
    ['화학공학과', 'http://chemeng.hanyang.ac.kr/'],
    ['생명공학과', 'http://bioeng.hanyang.ac.kr/http://ebe.hanyang.ac.kr/'],
    ['의예과', 'https://medix.hanyang.ac.kr/front/community/notice?BoardArticleSearch%5Bcategory%5D=15'],
    ['의학과', 'https://medix.hanyang.ac.kr/front/community/notice?BoardArticleSearch%5Bcategory%5D=44'],
    ['인문과학대학', 'http://humanities.hanyang.ac.kr/front/community/notice'],
    ['정치외교학과', 'http://psdcss.hanyang.ac.kr/index.php?menu_code1=4'],
    ['사회학과', 'http://socio.hanyang.ac.kr/blog/category/newsandevent/'],
    ['관광학부', 'http://etourism.kr/etourism/notice'],
    ['수학과', 'http://math.hanyang.ac.kr/'],
    ['물리학과', 'http://physics.hanyang.ac.kr/'],
    ['화학과', 'http://chem.hanyang.ac.kr/'],
    ['생명과학과', 'http://lifescience.hanyang.ac.kr/'],
    ['정책학과', 'http://hypolicy.hanyang.ac.kr/front/community/news/student-news'],
    ['행정학과', 'http://hypa.hanyang.ac.kr/front/major/major-notice'],
    ['경제금융학부', 'http://econ.hanyang.ac.kr/notice_und/list_hi.php'],
    ['사범대학', 'http://education.hanyang.ac.kr/front/community/notice'],
    ['의류학과', 'http://fashion.hanyang.ac.kr/board/bbs/board.php?bo_table=notice'],
    ['식품영양학과', 'http://www.fn.hanyang.ac.kr/'],
    ['실내건축디자인학과', 'http://www.interior.hanyang.ac.kr/front/community/notice'],
    ['음악대학', 'http://music.hanyang.ac.kr/index.php?menu_code1=5'],
    ['예술체육대학', 'http://copas.hanyang.ac.kr/front/community/notice'],
    ['국제학부(한글)', 'http://ishyu.hanyang.ac.kr/community/notice.php'],
    ['간호학부', 'http://nursing.hanyang.ac.kr/board/bbs/board.php?bo_table=notice'],
  ];

  let majorUrl;

  function compareMajorName(a, b) {
    const nameA = a[0];
    const nameB = b[0];
    if (nameA > nameB) {
      return 1;
    }
    if (nameA < nameB) {
      return -1;
    }
    return 0;
  }

  majors.sort(compareMajorName);


  document.querySelector('#majorpage').addEventListener('change', (evt) => {
    const pageUrl = evt.target.value;
    const $assertChange = document.querySelector('#assert-change');
    if (pageUrl) {
      whale.storage.sync.set({ majorUrl: pageUrl });
      majorUrl = pageUrl;
      $assertChange.classList.remove('hidden');
      setTimeout(() => {
        $assertChange.classList.add('hidden');
      }, 1000);
    }
  });

  document.querySelector('#not-keyword').addEventListener('keydown', (evt) => {
    if (evt.keyCode === 13) {
      const $assertChange = document.querySelector('#assert-change');
      const $target = evt.target;
      $target.placeholder = $target.value;
      whale.storage.sync.set({ notKeyword: $target.value });

      $assertChange.classList.remove('hidden');
      setTimeout(() => {
        $assertChange.classList.add('hidden');
      }, 1000);
    }
  });

  document.querySelectorAll('input[type="radio"]').forEach((e, i) => {
    e.addEventListener('click', () => {
      if (e.checked) {
        const $assertChange = document.querySelector('#assert-change');

        whale.storage.sync.set({ radioBtn: i + 1 });

        $assertChange.classList.remove('hidden');
        setTimeout(() => {
          $assertChange.classList.add('hidden');
        }, 1000);
      }
    });
  });

  (function init() {
    const $selectMajor = document.querySelector('#majorpage');
    const options = majors.map(m => `<option value='${m[1]}'>${m[0]}</option>`)
      .join('');
    $selectMajor.insertAdjacentHTML('beforeend', options);
    whale.storage.sync.get(['majorUrl', 'radioBtn', 'notKeyword'], (result) => {
      if (result.majorUrl) {
        const url = result.majorUrl;
        document.querySelector('#majorpage').value = url;
        majorUrl = url;
      }
      if (result.radioBtn) {
        const $radios = document.querySelectorAll('input[name="noti"]');
        $radios[result.radioBtn - 1].checked = true;
      }
      if (result.notKeyword) {
        document.querySelector('#not-keyword').placeholder = result.notKeyword;
      }
    });
  }());

  whale.storage.sync.get(['portalNoti'], (result) => {
    // portal notification
    const $portalNode = document.querySelector('#portalann UL');
    result.portalNoti.forEach((elem) => {
      $portalNode.insertAdjacentHTML('beforeend', `
      <li class="columnA">
        ${elem.date}<br>
        <a class="portal-noti-cell" href="https://portal.hanyang.ac.kr${elem.link}">${elem.title}</a>
      </li>
      `);
    });

    document.querySelector('#direct-visit-m').addEventListener('click', () => {
      if (majorUrl) {
        window.open(majorUrl);
      }
    });
  });
}());
