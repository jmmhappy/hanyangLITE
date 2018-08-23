(function copyText() {
  (function checkValidity() {
    document.body.addEventListener('mousedown', (evt) => {
      if (evt.button === 2) {
        whale.runtime.sendMessage('removeMenus');
        const currentTab = document.querySelector('.tab-wrap').innerHTML;
        if (currentTab.includes('교육과정조회')) {
          whale.runtime.sendMessage('validMenuCurri');
        } else if (currentTab.includes('졸업사정조회')) {
          whale.runtime.sendMessage('validMenuGrad');
        }
      }
    });
  }());

  function compareClassType(a, b) {
    const classType = ['교양필수', '전공기초(필수)', '전공핵심', '전공심화'];
    const indexA = classType.indexOf(a[5]);
    const indexB = classType.indexOf(b[5]);

    if (indexA > indexB) {
      return 1;
    }
    if (indexA < indexB) {
      return -1;
    }
    return 0;
  }

  function parseCurriculum(table) {
    const context = table.innerText;
    const splitRows = [];
    let curriculum = [];
    const temp = []; // reset at every semester change, for sorting.

    context.split('\n').forEach((r) => {
      splitRows.push(r.split('\t'));
    });

    curriculum.push(splitRows[0]);
    curriculum[0][7] = '학점';
    curriculum[0].splice(7, 0, '학기');

    for (let i = 2; i < splitRows.length - 1; i += 2) {
      const hakjeom = parseInt(splitRows[i][7], 10) + parseInt(splitRows[i + 1][7], 10) / 2;

      if (splitRows[i + 1][6] !== splitRows[i - 1][6] && i !== 2) {
        temp.sort(compareClassType);
        curriculum = curriculum.concat(temp);
        temp.length = 0; // empty
      }

      temp.push(splitRows[i]);
      temp[temp.length - 1][7] = hakjeom;
      temp[temp.length - 1].splice(7, 0, splitRows[i + 1][6]);
    }

    temp.sort(compareClassType);
    return curriculum.concat(temp);
  }

  whale.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const $table = document.elementFromPoint(500, 500).closest('TABLE');
    const date = moment.utc().format('YYYY-MM-DD');
    if (!$table) {
      return;
    }
    if (message === 'curriTable') {
      const curriculum = parseCurriculum($table);
      if (curriculum) {
        whale.storage.sync.set({
          curri: curriculum,
          curriUpdate: date,
        });
      }
    } else if (message === 'gradTable') {
      const context = $table.innerText;
      const splitRows = [];

      context.split('\n').forEach((r) => {
        splitRows.push(r.split('\t'));
      });
      if (splitRows) {
        whale.storage.sync.set({
          graduation: splitRows,
          gradUpdate: date,
        });
      }
    }
    sendResponse('table-store-succeed');
  });
}());
