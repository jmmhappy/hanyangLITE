whale.runtime.sendMessage('food', () => {});

(function init() {
  whale.storage.local.get('idlist', (result) => {
    const $main = document.body.querySelector('.mainboard');
    const $hyperlinks = document.body.querySelector('#remote-control');

    result.idlist.forEach((e) => {
      whale.storage.local.get(e, (data) => {
        const spacedMealTime = data[e].mealTime.replace(/\* /g, '\n')
          .replace(/,/g, '\n')
          .replace(/: /g, '\n')
          .trim();

        const trimmedTitle = data[e].name.replace(' ', '');
        $hyperlinks.innerHTML += `<a href="#${trimmedTitle}">${data[e].name}</a>`;

        let menuNames = '';
        for (let i = 0; i < data[e].menus.length; i += 1) {
          let trimmedMenuName = data[e].menus[i].name;
          let imgUrl = data[e].menus[i].thumbnail;

          if (trimmedMenuName.length > 30) {
            trimmedMenuName = trimmedMenuName.slice(0, 30);
            trimmedMenuName = trimmedMenuName.concat('...');
          }
          if (imgUrl.includes('no-img.jpg')) {
            imgUrl = '../image/no-thumbnail.png';
          }

          menuNames += `
          <section class='aMenu'>
          <a href=${imgUrl}>
            <img class="food-img" src="${imgUrl}">
          </a>`;
          menuNames += `
          <p class="food-desc">
            ${trimmedMenuName}<br>
            <span class="price">${data[e].menus[i].price}</span>
          </p>
          </section>
          `;
        }

        $main.insertAdjacentHTML('beforeend', `
        <section id=${trimmedTitle} class="cafeteria">
          <p class="button-title-cafe">${data[e].name}</p>
          <table class="subinfo">
            <tbody>
              <tr>
                <td>${data[e].location}</td>
              </tr>
              <tr>
                <td>${spacedMealTime}</td>
              </tr>
            </tbody>
          </table>
          <section>
          ${menuNames}
          </section>
        </section>
        `);

        setTimeout(() => {
          $main.querySelectorAll('img').forEach(($img) => {
            $img.addEventListener('error', () => {
              $img.src = whale.runtime.getURL('../image/no-thumbnail.png');
            });
          });
        }, 10);
      });
    });
  });
}());
