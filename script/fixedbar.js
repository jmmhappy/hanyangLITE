(function bar() {
  const config = {
    alts: ['학식', '정보', '공지', '메일'],
    htmls: ['index.html', 'myinfo.html', 'announce.html', 'mail.html'],
    names: ['cutlery.png', 'profile.png', 'idea.png', 'email.png'],
  };
  whale.runtime.sendMessage('mail', () => {});
  // create bar
  const $fixedbar = document.querySelector('.fixed-bar');
  let buttonHTMLs = '';
  whale.storage.local.get('nowAt', (result) => {
    for (let i = 0; i < 4; i += 1) {
      let name = config.names[i];
      if (i === result.nowAt) {
        name = name.replace('.', 'A.');
        whale.sidebarAction.show({
          url: whale.runtime.getURL(config.htmls[i]),
        });
      }
      buttonHTMLs += `<a href="${config.htmls[i]}" class="menu-button">`;
      buttonHTMLs += `
      <img class='icons' src='image/00${i + 1}-${name}' alt=${config.alts[i]}>`;
      buttonHTMLs += '</a>';
    }
    $fixedbar.innerHTML = buttonHTMLs;
  });

  // on activation
  $fixedbar.addEventListener('click', (evt) => {
    if (evt.target.tagName === 'IMG') {
      const index = config.alts.indexOf(evt.target.alt);
      whale.storage.local.set({ nowAt: index });
    } else if (evt.target.tagName === 'A') {
      const index = config.alts.indexOf(evt.target.firstElementChild.alt);
      whale.storage.local.set({ nowAt: index });
    }
  });

  whale.sidebarAction.getBadgeText((count) => {
    if (count) {
      const $badge = document.createElement('SECTION');
      $badge.classList.add('mini-badge');
      $badge.innerText = count;
      $fixedbar.lastElementChild.appendChild($badge);
    }
  });
}());
