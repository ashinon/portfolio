/**
 * スライダークラス
 */
export default class Slider {
  /**
   * constructor
   * @param {number} ms
   * @param {object} sections
   * @param {object} sectionIdx
   */
  constructor(ms = 5000, sections, sectionIdx) {
    this.sections = sections;
    this.sectionIdx = sectionIdx;
    this.time = ms;
    this.setSlider();
  }

  /**
   * スライダー
   */
  setSlider() {
    const setImage = [
      'dist/img/slider01.jpg',
      'dist/img/slider02.jpg',
      'dist/img/slider03.jpg',
      'dist/img/slider04.jpg',
    ];
    const view = this.sections[this.sectionIdx.about].querySelector('#view');
    const prev = this.sections[this.sectionIdx.about].querySelector('#prev');
    const next = this.sections[this.sectionIdx.about].querySelector('#next');
    const thumbnailList = this.sections[this.sectionIdx.about].querySelector('#thumbnailList');

    let list;
    let image;
    let current = 0;
    let clickBtn = true;

    const createThumbnailItem = () => {
      for (let i = 0; i < setImage.length; i++) {
        list = document.createElement('li');
        image = document.createElement('img');
        image.src = setImage[i];
        list.appendChild(image);
        thumbnailList.appendChild(list);

        if (i === 0) {
          list.classList.add('selected');
        }

        list.addEventListener('click', () => {
          view.src = this.children[0].src;

          for (let j = 0; j < thumbnailList.children.length; j++) {
            thumbnailList.children[j].classList.remove('selected');
          }
          this.classList.add('selected');
          let currentImage = this.children[0].src.slice(-6, -4);
          current = Number(currentImage) - 1;
        });
      }
    };
    createThumbnailItem();

    prev.addEventListener('click', () => {
      if (clickBtn === true) {
        clickBtn = false;
        view.classList.add('appear');
        thumbnailList.children[current].classList.remove('selected');
        current--;
        if (current < 0) {
          current = setImage.length - 1;
        }
        view.src = setImage[current];
        thumbnailList.children[current].classList.add('selected');
        setTimeout('view.classList.remove("appear");', 2100);
        setTimeout(() => {
          clickBtn = true;
        }, 2100);
      } else {
        return false;
      }
    });

    next.addEventListener('click', () => {
      if (clickBtn === true) {
        clickBtn = false;
        view.classList.add('appear');
        thumbnailList.children[current].classList.remove('selected');
        current++;
        if (current > setImage.length - 1) {
          current = 0;
        }
        view.src = setImage[current];
        thumbnailList.children[current].classList.add('selected');
        setTimeout('view.classList.remove("appear");', 2100);
        setTimeout(() => {
          clickBtn = true;
        }, 2100);
      } else {
        return false;
      }
    });

    const autoPlay = () => {
      setTimeout(() => {
        next.click();
        autoPlay();
      }, this.time);
    };
    autoPlay();
    window.onload = autoPlay();
  }
}
