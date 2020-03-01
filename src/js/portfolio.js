import Slider from './slider.js';

export default class Portfolio {
  constructor() {
    this.touchDevice = this.isTouchDevice();
    this.allSelector = document.querySelector('body');
    this.wrapper = this.allSelector.querySelector('#wrapper');
    this.sections = this.allSelector.querySelectorAll('div.section');
    this.navList = this.allSelector.querySelectorAll('nav li');
    this.anime;
    this.sectionTops;
    this.moveFlug = false;
    this.transitionSpeed;
    this.scrollTopCurrent;
    this.setTransitionSpeed();
    this.getElemsTop();
    this.setBG(this.transitionSpeed);
    this.addEvents();
    new Slider(this.allSelector.querySelector('#about'), 5000);
  }

  setTransitionSpeed() {
    if (this.touchDevice) {
      this.transitionSpeed = '800';
    } else {
      this.transitionSpeed = '1000';
    }
  }

  /**
   * 各要素のtopの位置を求める
   */
  getElemsTop() {
    this.sectionTops = [];
    this.sections.forEach(elem => {
      const rect = elem.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elemsTop = rect.top + scrollTop;
      this.sectionTops.push(elemsTop);
    });
  }

  /**
   * 背景変更メソッドに渡すプロパティをセット、実行
   * @param {number} speed 変化速度
   * @param {number} y 現在のスクロール位置
   */
    let scrollTop;
    if (this.scrollTopCurrent > 0) {
      scrollTop = this.scrollTopCurrent;
      // 再読み込み後の表示の場合
      this.scrollTopCurrent = 0;
    } else if (y !== undefined) {
      scrollTop = y;
    } else {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }
    let referenceHeight = 0;
    if (touchDevice) {
      referenceHeight = window.innerHeight * -0.2;
    } else {
      // 上部naviの領域プラス20pxくらいで色変更する
      referenceHeight = 75 + 25 + 20;
    }
    for (let i = this.sectionTops.length - 1; i >= 0; i--) {
      if (scrollTop > this.sectionTops[i] - referenceHeight) {
        this.chengeBG(i, speed);
        break;
      }
    }
  }

  /**
   * 背景色を変更する
   * @param {number} secNum
   * @param {number} speed
   */
  chengeBG(secNum, speed = this.transitionSpeed) {
    //現在の番号
    let current = -1;
    //カラー設定の配列
    let bgColor = ['rgba(255, 182, 193, 1)', 'rgba(173, 216, 230, 1)', 'rgba(173, 216, 230, .5)'];
    if (secNum != current && this.moveFlug == false) {
      current = secNum;
      this.stopAnimation(this.anime);
      this.startAnimation(this.allSelector, { backgroundColor: bgColor[current] }, 200, speed);
    }
  }

  /**
   * .animate()の代用
   * @param {obj} elem
   * @param {obj} option
   * @param {number} time
   * @param {number} speed
   */
  startAnimation(elem, option, time, speed) {
    const begin = new Date() - 0;
    this.anime = setInterval(() => {
      var current = new Date() - begin;
      if (current > time) {
        clearInterval(this.anime);
        current = time;
      }
      Object.keys(option).forEach(optName => {
        elem.style[optName] = option[optName];
        elem.style['transitionDuration'] = speed + 'ms';
      });
    }, 10);
  }

  /**
   * .stop()の代用
   * @param {obj} anime
   */
  stopAnimation(anime) {
    clearInterval(anime);
  }

  /**
   * イベント付与メソッドをまとめて実行
   */
  addEvents() {
    this.addEventUnload();
    this.setPropForChangeColor();
    this.addEventResize();
  }

  /**
   * スクロールに応じて背景色を変える
   */
  setPropForChangeColor() {
    if (this.touchDevice) {
      // スマホ用
      let touchObject = {};
      this.wrapper.addEventListener('touchmove', event => {
        touchObject = event.changedTouches[0];
        this.setBG(this.transitionSpeed, touchObject.pageY);
      });
      this.wrapper.addEventListener('touchend', event => {
        touchObject = event.changedTouches[0];
        this.setBG(this.transitionSpeed, touchObject.pageY);
      });
    } else {
      // PC用
      window.addEventListener(
        'scroll',
        () => {
          this.setBG(this.transitionSpeed);
        },
        { passive: true }
      );
    }
  }

  /**
   * resizeイベント時のメソッド
   * スクロール位置を取得し、背景色を変更
   */
  addEventResize() {
    window.addEventListener('resize', () => {
      this.getElemsTop();
      this.setBG(this.transitionSpeed);
    });
  }

  /**
   * 再読み込みされた時のイベント処理
   * スクロール位置を取得
   */
  addEventUnload() {
    window.addEventListener('beforeunload', () => {
      if (this.hasLocalStorage()) {
        window.localStorage.setItem('sectionalPosition', window.pageYOffset);
      }
    });
    window.addEventListener('unload', () => {
      if (this.hasLocalStorage()) {
        window.pageYOffset = window.localStorage.getItem('sectionalPosition');
        this.scrollTopCurrent = window.pageYOffset || document.documentElement.scrollTop;
      }
    });
  }

  /**
   * ローカルストレージを使えるデバイスか否かの判定
   */
  hasLocalStorage() {
    const checkKey = 'haslocalstorage';
    try {
      window.localStorage.setItem(checkKey, 1);
      window.localStorage.getItem(checkKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * タッチデバイスかどうかを判定
   */
  isTouchDevice() {
    if ('ontouchmove' in window) {
      return true;
    } else {
      return false;
    }
  }
}
