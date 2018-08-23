(function info() {
  const gradeMacro = `
  <td>
  <select class='grades'>
    <option value="no">.</option>
    <option value='4.5'>A+</option>
    <option value='4.0'>A0</option>
    <option value='3.5'>B+</option>
    <option value='3.0'>B0</option>
    <option value='2.5'>C+</option>
    <option value='2.0'>C0</option>
    <option value='1.5'>D+</option>
    <option value='1.0'>D0</option>
    <option value='0'>F</option>
  </select>
  </td>
  `;

  function tableSplitter(splittedRows, where, toShow) {
    const $table = document.createElement('TABLE');
    let flag = true;
    let inTable = '<tbody>';

    // curriculum -> calculator selection
    splittedRows.forEach((tr) => {
      if (where === '#curri') {
        if (Number.isNaN(parseInt(tr[7], 10))) {
          flag = true;
          inTable += '<tr>';
        } else {
          inTable += '<tr class="subject-title-table">';
        }
      } else {
        inTable += '<tr>';
      }

      // split header and content
      for (let i = 0; i < tr.length; i += 1) {
        if (toShow.indexOf(i) !== -1) {
          if (flag) {
            inTable += `<th>${tr[i]}</th>`;
          } else {
            inTable += `<td>${tr[i]}</td>`;
          }
        }
      }
      flag = false;
      inTable += '</tr>';
    });
    inTable += '</tbody>';
    $table.innerHTML = inTable;
    document.body.querySelector(where).appendChild($table);
  }

  // 필터
  function filter(curriculum, type) {
    const filtered = [];
    const $previousTable = document.querySelector('#curri TABLE');
    let second = false;

    if ($previousTable) {
      $previousTable.remove();
    }

    if (type === '0') {
      tableSplitter(curriculum, '#curri', [2, 3, 5, 6, 8]);
    } else if (type !== '6') {
      for (let i = 0; i < curriculum.length; i += 1) {
        if (curriculum[i][6] === type || Number.isNaN(parseInt(curriculum[i][6], 10))) {
          if (!second && parseInt(curriculum[i][7], 10) === 2) {
            second = true;
            filtered.push(['-', '-', '-', '-', '-', '-', '-', '-', '-']);
            filtered.push(curriculum[0]);
          }
          filtered.push(curriculum[i]);
        }
      }
      tableSplitter(filtered, '#curri', [2, 3, 5, 8]);
    }
  }

  // 교육 과정 필터 표시 창
  function filterTxt($target) {
    $target.insertAdjacentHTML('beforeend', `
    <select class='selectHakneoun' name='filterType'>
      <option value='0'>전부 보이기</option>
      <option value='1'>1학년</option>
      <option value='2'>2학년</option>
      <option value='3'>3학년</option>
      <option value='4'>4학년</option>
      <option value='5'>5학년</option>
      <option value='6'>전부 숨기기</option>
    </select>
    `);

    const $selection = $target.children[0];
    whale.storage.local.get('filterType', (result) => {
      $selection.value = result.filterType;
    });
  }

  // 졸업 사정 / 교육 과정 가져오기
  whale.storage.sync.get(['graduation', 'curri'], (result) => {
    const $userSelection = document.querySelector('.selectHakneoun');
    $userSelection.addEventListener('change', () => {
      whale.storage.local.set({ filterType: $userSelection.value });
      filter(result.curri, $userSelection.value);
    });

    if (result.graduation) {
      const $tutorial = document.querySelector('#grad-tutorial');
      if ($tutorial) {
        $tutorial.remove();
      }

      document.querySelector('#updateGdate')
        .closest('SECTION')
        .classList.remove('hidden');

      tableSplitter(result.graduation, '#grad', [0, 1, 2, 3, 5]);
    } else {
      document.querySelector('#grad').insertAdjacentHTML('beforeend', `
      <section id="grad-tutorial" class="tutorial">
        <section>
        <span>1. 한양대학교 포털 로그인</span>
        <a class="visit" href="https://portal.hanyang.ac.kr/sso/lgin.do" target="_blank">
          포털 바로가기
        </a><br>
        <span>2. 나의 이수현황 세부정보확인</span><br>
        <img width="100%" src="../image/tutorial3.jpg">
        <span>3. 오른쪽 마우스 클릭</span><br>
        <img width="100%" src="../image/tutorial4.jpg">
        </section>
      </section>
      `);
    }
    if (result.curri) {
      const $tutorial = document.querySelector('#curri-tutorial');
      if ($tutorial) {
        $tutorial.remove();
      }

      document.querySelector('#updateCdate')
        .closest('SECTION')
        .classList.remove('hidden');

      // 초기 설정 가져오기
      whale.storage.local.get('filterType', (resultfilter) => {
        if (resultfilter.filterType && resultfilter.filterType !== '0') {
          filter(result.curri, resultfilter.filterType);
        } else {
          whale.storage.local.set({ filterType: '0' });
          tableSplitter(result.curri, '#curri', [2, 3, 5, 6, 7]);
        }
      });
    } else {
      document.querySelector('#curri').insertAdjacentHTML('beforeend', `
      <section id="curri-tutorial" class="tutorial">
        <section>
        <span>1. 한양대학교 포털 로그인</span>
        <a class="visit" href="https://portal.hanyang.ac.kr/sso/lgin.do" target="_blank">
          포털 바로가기
        </a><br>
        <span>2. 수업 > 교육과정조회 클릭</span><br>
        <img width="100%" src="../image/tutorial1.jpg">
        <span>3. 학과 선택 후 오른쪽 마우스 클릭</span><br>
        <img width="100%" src="../image/tutorial2.jpg">
        </section>
      </section>
      `);
    }
  });

  function storeScore(subjects, scores, hakjeoms) {
    // 내용 저장
    const scoreList = [];

    const isValid = Array.from(scores).every((elem, i) => {
      const name = subjects[i].value;
      const score = elem.value;
      const hakjeom = parseInt(hakjeoms[i].value, 10);

      const element = {
        name,
        score,
        hakjeom,
      };

      scoreList.push(element);
      return (score !== 'no' && hakjeom) || (score === 'no' && !hakjeom);
    });

    if (isValid) {
      whale.storage.local.set({ scoreNow: scoreList });

      const $popUp = document.querySelector('#popUp');
      $popUp.firstElementChild.innerHTML = '저장 완료<br>';
      $popUp.classList.remove('hidden');
      return true;
    }

    const $popUp = document.querySelector('#popUp');
    $popUp.firstElementChild.innerHTML = '학점과 성적을 빠짐 없이 기재해주세요.<br>';
    $popUp.classList.remove('hidden');

    return false;
  }

  // 학점 입력창
  function calculator($target) {
    let data = `
    <form action="storeScore">
    <input type="button" name="oneLineDelete" value="한 줄 비우기">
    <input type="reset" value="전부 비우기">
      <table>
        <tbody>
          <tr>
            <th width="10%">번호</th>
            <th max-width="50%">과목 이름</th>
            <th width="20%">점수</th>
            <th width="20%">학점</th>
          </tr>
    `;
    for (let i = 1; i < 10; i += 1) {
      data += `
      <tr>
        <td class="calc-data">${i}</td>
        <td><input type="text" class="subject-name"></td>
        ${gradeMacro}
        <td>
          <input type="number" min="1" max="4" class="time-amount">
        </td>
      </tr>
      `;
    }
    data += '</tbody></table></form>';
    $target.insertAdjacentHTML('afterbegin', data);

    document.querySelector('input[name="oneLineDelete"]').addEventListener('click', () => {
      const $calcDec = document.querySelectorAll('#putScore TABLE TR');
      for (let i = 1; i < $calcDec.length; i += 1) {
        const $hakjeomNode = $calcDec[i].children[3].firstElementChild;
        if (!$hakjeomNode.value) {
          $calcDec[i - 1].innerHTML = `
            <td class="calc-data">${i - 1}</td>
            <td><input type="text" class="subject-name"></td>
            ${gradeMacro}
            <td>
              <input type="number" min="1" max="4" class="time-amount">
            </td>
          `;
          break;
        }
      }
    });
  }

  // 저장된 학점 가져오기
  whale.storage.local.get(['ave_score', 'scoreNow'], (result) => {
    if (result.scoreNow) {
      const $subjectNames = document.querySelectorAll('.subject-name');
      const $scores = document.querySelectorAll('.grades');
      const $hakjeoms = document.querySelectorAll('.time-amount');
      result.scoreNow.forEach((e, i) => {
        if (e.hakjeom) {
          $subjectNames[i].value = e.name;
          $scores[i].value = e.score;
          $hakjeoms[i].value = e.hakjeom;
        }
      });
    }
    if (result.ave_score) {
      document.querySelector('#score').value = result.ave_score;
    }
  });

  // 계산기
  document.body.querySelector('#score').addEventListener('click', () => {
    let sum = 0;
    let count = 0;
    let average = 0;
    const $subjectNames = document.querySelectorAll('.subject-name');
    const $scores = document.querySelectorAll('.grades');
    const $hakjeoms = document.querySelectorAll('.time-amount');

    if (!storeScore($subjectNames, $scores, $hakjeoms)) {
      return;
    }
    // 계산 후 결과 저장
    $scores.forEach((e, i) => {
      const hakjeom = parseInt($hakjeoms[i].value, 10);
      if (e.value !== 'no' && hakjeom) {
        sum += parseFloat(e.value, 10) * hakjeom;
        count += hakjeom;
      }
    });

    if (!count) {
      average = 0;
    } else {
      average = (sum / count).toFixed(2);
      average = parseFloat(average, 10);
    }

    if (Number.isNaN(average)) {
      const $popUp = document.querySelector('#popUp');
      $popUp.firstElementChild.innerHTML = '학점과 성적을 빠짐 없이 기재해주세요.<br>';
      $popUp.classList.remove('hidden');
    } else {
      whale.storage.local.set({ ave_score: average });
      document.querySelector('#score').value = average;
    }
  });

  document.body.querySelector('#closePopUp').addEventListener('click', (evt) => {
    evt.target.closest('SECTION').classList.add('hidden');
  });

  // 최종 수정일 업데이트
  whale.storage.sync.get(['curriUpdate', 'gradUpdate'], (result) => {
    if (result.curriUpdate) {
      document.body.querySelector('#updateCdate').innerText = result.curriUpdate;
    }
    if (result.gradUpdate) {
      document.body.querySelector('#updateGdate').innerText = result.gradUpdate;
    }
  });

  document.querySelector('#curri').addEventListener('click', (evt) => {
    if (evt.target.tagName === 'TD') {
      const $rowInfo = evt.target.closest('TR').children;
      const name = $rowInfo[1].innerText;
      const hakjeom = $rowInfo[3].innerText;
      const $calcDec = document.querySelectorAll('#putScore TABLE TR');

      for (let i = 1; i < $calcDec.length; i += 1) {
        const $nameNode = $calcDec[i].children[1].firstElementChild;
        const $hakjeomNode = $calcDec[i].children[3].firstElementChild;
        if (!$nameNode.value) { // empty name node
          $nameNode.value = name;
          $hakjeomNode.value = hakjeom;
          break;
        }
      }
    }
  });

  function start() {
    const $target = document.querySelectorAll('.subinfo-calc');

    $target.forEach((e) => {
      if (e.id === 'filter') {
        filterTxt(e);
      } else if (e.id === 'putScore') {
        calculator(e);
      }
    });
  }

  start();
}());
