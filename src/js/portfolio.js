import Slider from './slider.js';
import SlideContents from './slide_contents.json';

/**
 * ポートフォリオ画面の表示・イベントのクラス
 */
export default class Portfolio {
  constructor() {
    this.anime;
    this.boundaries;
    this.transitionSpeed;
    this.scrollTopPrev = 0; // 再読み込み前のスクロール位置
    this.scrollTopLast = 0; // 1つ前のスクロール位置(スクロール方向判定用)
    this.touchDevice = this.isTouchDevice();
    this.allSelector = document.querySelector('body');
    this.wrapper = this.allSelector.querySelector('#wrapper');
    this.sections = this.allSelector.querySelectorAll('div.section');
    this.introduction = this.allSelector.querySelector('#introduction');
    this.nav = this.allSelector.querySelector('#globalNavi');
    this.setTransitionSpeed();
    this.getBoundaries();
    this.setBG(0);
    this.addEvents();
    this.setSliderProp(this.allSelector.querySelector('#profile'));
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

  /**
   * スライダークラスの呼び出し
   * @param {obj} target スライダーを表示するエレメント
   * @param {number} ms オートプレイのスピード
   */
  setSliderProp(target) {
    const ms = 5000;
    const dispTileList = false;
    const loopLimit = 1;
    this.slider = new Slider(target, SlideContents, ms, loopLimit, dispTileList);
  }

  /**
   * 背景色変化のアニメーションの速度をセットする
   */
  setTransitionSpeed() {
    if (this.touchDevice) {
      this.transitionSpeed = '800';
    } else {
      this.transitionSpeed = '1200';
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
        let referenceHeight = 40 + 20; // ナビゲーション+αの高さで背景色変更する
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
    const scrollTop = this.scrollTopPrev || this.getScrollTop(y);
    this.scrollTopPrev = 0;
    for (let i = this.boundaries.length - 1; i >= 0; i--) {
      if (scrollTop >= this.boundaries[i]) {
        this.chengeBG(i, speed);
        break;
      }
    }
  }

  /**
   * ナビゲーションにfixedクラスを付与
   * @param {number} y 現在のスクロール位置
   */
  setFixedClass(y) {
    const scrollTop = this.getScrollTop(y);
    const underNaviHeight = this.introduction.getBoundingClientRect().height;
    const adjuster = this.touchDevice ? -15 : -15;
    if (scrollTop < this.boundaries[1] - underNaviHeight + adjuster) {
      // スクロール位置がナビゲーションより上だったらfixedクラスを外す
      this.nav.classList.remove('fixed');
    } else {
      if (this.touchDevice) {
        if (scrollTop > this.scrollTopLast) {
          // モバイルで下向き移動の時はfixedクラスを外す
          this.nav.classList.remove('fixed');
        } else {
          // モバイル上向き移動の時はfixedにしてフェードインさせる
          this.nav.classList.add('fixed');
        }
      } else {
        // PCで2番目以降のエリアだったらfixedにする
        this.nav.classList.add('fixed');
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
    let bgColor = [
      'rgba(176, 196, 222, 0.5)', // 水色
      'rgba(236, 225, 145, 0.3)', // 黄色
      'rgba(255, 182, 193, 0.3)', // ピンク
      'rgba(187, 161, 212, 0.3)', // 紫
      'rgba(145, 236, 186, 0.3)', // 緑
    ];
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
      let current = new Date() - begin;
      if (current > time) {
        clearInterval(this.anime);
        current = time;
      }
      Object.keys(option).forEach(optName => {
        elem.style[optName] = option[optName];
        elem.style.transitionDuration = speed + 'ms';
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
    this.addEventScrolle();
    this.addEventResize();
    this.addEventArrowKeyDown();
  }

  /**
   * スクロールに応じたイベントを付与する
   */
  addEventScrolle() {
    window.addEventListener(
      'scroll',
      () => {
        this.setBG(this.transitionSpeed);
        this.setFixedClass();
        this.scrollTopLast = this.getScrollTop();
      },
      { passive: true }
    );
  }

  /**
   * resizeイベント時のメソッド
   * スクロール位置を再取得し、背景色を変更
   */
  addEventResize() {
    window.addEventListener('resize', () => {
      this.getBoundaries();
      this.setBG(this.transitionSpeed);
      this.setFixedClass();
    });
  }

  /**
   * スライダーの左右キー押下に応じたイベントを付与する
   */
  addEventArrowKeyDown() {
    document.addEventListener('keydown', event => {
      const scrollTop = this.getScrollTop();
      if (scrollTop < this.boundaries[2]) {
        if (event.key === 'ArrowRight') {
          this.slider.next.click();
        } else if (event.key === 'ArrowLeft') {
          this.slider.prev.click();
        }
      }
    });
  }

  /**
   * 再読み込みされた時のイベント処理
   * スクロール位置を取得
   */
  addEventUnload() {
    window.addEventListener(
      'beforeunload',
      () => {
        if (this.hasLocalStorage()) {
          window.localStorage.setItem('sectionalPosition', window.pageYOffset);
        }
      },
      { once: true }
    );
    window.addEventListener(
      'unload',
      () => {
        if (this.hasLocalStorage()) {
          window.pageYOffset = window.localStorage.getItem('sectionalPosition');
          this.scrollTopPrev = window.pageYOffset || document.documentElement.scrollTop;
        }
      },
      { once: true }
    );
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
