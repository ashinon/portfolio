/**
 * スライダークラス
 */
export default class Slider {
  /**
   * constructor
   * @param {object} target スライダーを表示するエレメント
   * @param {number} ms オートプレイのスピード
   * @param {number} loopLimit ループ回数
   */
  constructor(target, ms = 5000, loopLimit = 0) {
    this.target = target;
    this.time = ms;
    this.limit = loopLimit;

    this.setView = [
      'dist/img/slider01.jpg',
      'dist/img/slider02.jpg',
      'dist/img/slider03.jpg',
      'dist/img/slider04.jpg',
    ];
    this.view = this.target.querySelector('.slideView');
    this.prev = this.target.querySelector('.slidePrev');
    this.next = this.target.querySelector('.slideNext');
    this.thumbnailList = this.target.querySelector('.thumbnailList');
    this.current = 0;
    this.clickBtn = true;
    this.setSlider();
  }

  /**
   * スライダー
   */
  setSlider() {
    this.createThumbnailItem();
    this.setPrevsEvent();
    this.setNextsEvent();
    this.autoPlay();
    window.onload = this.autoPlay();
  }

  /**
   * prev押下時のイベントをセット
   */
  setPrevsEvent() {
    this.prev.addEventListener('click', () => {
      if (this.clickBtn === true) {
        this.clickBtn = false;
        this.view.classList.add('appear');
        this.thumbnailList.children[this.current].classList.remove('selected');
        this.current--;
        if (this.current < 0) {
          this.current = this.setView.length - 1;
        }
        this.view.src = this.setView[this.current];
        this.thumbnailList.children[this.current].classList.add('selected');
        setTimeout('view.classList.remove("appear");', 2100);
        setTimeout(() => {
          this.clickBtn = true;
        }, 2100);
      } else {
        return false;
      }
    });
  }

  /**
   * next押下のイベントをセット
   */
  setNextsEvent() {
    this.next.addEventListener('click', () => {
      if (this.clickBtn === true) {
        this.clickBtn = false;
        this.view.classList.add('appear');
        this.thumbnailList.children[this.current].classList.remove('selected');
        this.current++;
        if (this.current > this.setView.length - 1) {
          this.current = 0;
        }
        this.view.src = this.setView[this.current];
        this.thumbnailList.children[this.current].classList.add('selected');
        setTimeout('view.classList.remove("appear");', 2100);
        setTimeout(() => {
          this.clickBtn = true;
        }, 2100);
      } else {
        return false;
      }
    });
  }

  /**
   * オートプレイ
   */
  autoPlay() {
    setTimeout(() => {
      this.next.click();
      this.autoPlay();
    }, this.time);
  }

  /**
   * ページャーみたいな部分を作る
   */
  createThumbnailItem() {
    let list;
    let image;
    for (let i = 0; i < this.setView.length; i++) {
      list = document.createElement('li');
      image = document.createElement('img');
      image.src = this.setView[i];
      list.appendChild(image);
      this.thumbnailList.appendChild(list);

      if (i === 0) {
        list.classList.add('selected');
      }

      list.addEventListener('click', () => {
        this.view.src = this.children[0].src;

        for (let j = 0; j < this.thumbnailList.children.length; j++) {
          this.thumbnailList.children[j].classList.remove('selected');
        }
        this.classList.add('selected');
        let currentImage = this.children[0].src.slice(-6, -4);
        this.current = Number(currentImage) - 1;
      });
    }
  }
}
