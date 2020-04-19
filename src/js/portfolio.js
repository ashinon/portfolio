import Slider from './slider.js';

/**
 * ポートフォリオ画面の表示・イベントのクラス
 */
export default class Portfolio {
  constructor() {
    this.anime;
    this.boundaries;
    this.transitionSpeed;
    this.scrollTopCurrent = 0;
    this.touchDevice = this.isTouchDevice();
    this.allSelector = document.querySelector('body');
    this.wrapper = this.allSelector.querySelector('#wrapper');
    this.sections = this.allSelector.querySelectorAll('div.section');
    this.setTransitionSpeed();
    this.getBoundaries();
    this.setBG(0);
    this.addEvents();
    new Slider(this.allSelector.querySelector('#about'), 5000);
    this.hideLoadingAnime();
  }

  /**
   * トップの背景画像読み込み完了時に読み込み中アニメーションを非表示
   */
  hideLoadingAnime() {
    const bgPhoto = document.getElementById('bg-photo');
    const imgPass = 'dist/img/';
    let url =
      bgPhoto.style['background-image'] || window.getComputedStyle(bgPhoto, '')['background-image'];
    url = url.replace(/^url.+?img\/([^/]+?)"\)/, '$1').replace(/(.+?)$/, imgPass + '$1');
    const img = document.createElement('img');
    img.src = url;
    img.width = img.height = 1;
    this.wrapper.appendChild(img);
    img.onload = () => {
      document.getElementById('preLoading').style.display = 'none';
      this.wrapper.removeChild(img);
    };
  }
  }

  /**
   * 背景色変化のアニメーションの速度をセットする
   */
  setTransitionSpeed() {
    if (this.touchDevice) {
      this.transitionSpeed = '800';
    } else {
      this.transitionSpeed = '1000';
    }
  }

  /**
   * 各要素の背景色が変わる境界位置を求める
   */
  getBoundaries() {
    this.boundaries = [];
    this.sections.forEach((elem, i) => {
      const rect = elem.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elemsTop = rect.top + scrollTop;
      // 最上部は0にする
      let boundary = 0;
      if (i > 0) {
        let referenceHeight = 75 + 25 + 30;
        if (this.touchDevice) {
          // タッチデバイス
          boundary = elemsTop;
        } else {
          // PC：上部navi領域-余白の高さ
          boundary = elemsTop - referenceHeight;
        }
      }
      this.boundaries.push(boundary);
    });
  }

  /**
   * 背景変更メソッドに渡すプロパティをセット、実行
   * @param {number} speed 変化速度
   * @param {number} y 現在のスクロール位置
   */
  setBG(speed, y) {
    const scrollTop = this.getScrollTop(y);
    for (let i = this.boundaries.length - 1; i >= 0; i--) {
      if (scrollTop >= this.boundaries[i]) {
        this.chengeBG(i, speed);
        break;
      }
    }
  }

  /**
   * スクロール位置を取得する
   * @param {number} param
   * @return {number} scrollTop
   */
  getScrollTop(param) {
    let scrollTop;
    if (param !== undefined) {
      // 呼び出し元でスクロール位置の指定がある場合
      scrollTop = param;
    } else if (this.scrollTopCurrent > 0) {
      // 再読み込み後の場合
      scrollTop = this.scrollTopCurrent;
      this.scrollTopCurrent = 0;
    } else {
      // どちらでもない場合
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    }
    return scrollTop;
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
    if (secNum != current) {
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
    this.addEventChangeColor();
    this.addEventResize();
  }

  /**
   * スクロールに応じて背景色を変える
   */
  addEventChangeColor() {
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
   * スクロール位置を再取得し、背景色を変更
   */
  addEventResize() {
    window.addEventListener('resize', () => {
      this.getBoundaries();
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
