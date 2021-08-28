import Slider from './slider';
import SlideContents from './self-introduction.json';
import '../sass/style.scss';

/**
 * ポートフォリオ画面の表示・イベントのクラス
 */
export default class Portfolio {
  transitionSpeed: number = 0;
  boundaries: number[] = [];
  scrollTopLast: number = 0;
  //カラー設定の配列
  bgColorClassList = [
    'bg-blue',
    'bg-yellow',
    'bg-pink',
    'bg-purple',
    'bg-green',
  ];
  transitionDurationClassList = {
    pc: 'transition-duration-pc-device',
    mobile: 'transition-duration-touch-device'
  };
  touchDevice: boolean = false;
  bodyElement: HTMLElement;
  wrapper: HTMLElement;
  sections: NodeList;
  introduction: HTMLElement;
  nav: HTMLElement;
  slider: any;

  constructor() {
    this.boundaries;
    this.scrollTopLast = 0; // 1つ前のスクロール位置(スクロール方向判定用)
    this.touchDevice = this.isTouchDevice();
    this.bodyElement = document.querySelector('body')!;
    this.wrapper = this.bodyElement.querySelector('#wrapper')!;
    this.sections = this.bodyElement.querySelectorAll('div.section');
    this.introduction = this.bodyElement.querySelector('#introduction')!;
    this.nav = this.bodyElement.querySelector('#globalNavi')!;
    this.getBoundaries();
    this.setBG();
    this.addEvents();
    this.setSliderProp(this.bodyElement!.querySelector('#profile'));
    this.hideLoadingAnime();
  }

  /**
   * トップの背景画像読み込み完了時に読み込み中アニメーションを非表示
   */
  hideLoadingAnime() {
    const bgPhoto: HTMLElement = document.getElementById('bg-photo')!;
    const imgPass = 'dist/img/';
    let url: string =
      bgPhoto.style[<any>'background-image'] ||
      window.getComputedStyle(bgPhoto, '')[<any>'background-image'];
    url = url.replace(/^url.+?img\/([^/]+?)"\)/, '$1').replace(/(.+?)$/, imgPass + '$1');
    const img = document.createElement('img');
    img.src = url;
    img.width = img.height = 1;
    this.wrapper.appendChild(img);
    img.onload = () => {
      const preLoading: HTMLElement = document.getElementById('preLoading')!;
      preLoading.style.display = 'none';
      this.wrapper!.removeChild(img);
    };
  }

  /**
   * スライダークラスの呼び出し
   * @param {obj} target スライダーを表示するエレメント
   * @param {number} ms オートプレイのスピード
   */
  setSliderProp(target: any) {
    const ms = 5000;
    const dispTileList = false;
    const loopLimit = 1;
    this.slider = new Slider(target, SlideContents, ms, loopLimit, dispTileList);
  }

  /**
   * 各要素の背景色が変わる境界位置を求める
   */
  getBoundaries() {
    this.boundaries = [];
    this.sections.forEach((elem : Node, i: number) => {
      const tmpElem = elem as HTMLElement;
      const rect : { [key: string]: any } = tmpElem.getBoundingClientRect();
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
   */
  setBG() {
    const scrollTop = this.getScrollTop();
    for (let i = this.boundaries.length - 1; i >= 0; i--) {
      if (scrollTop >= this.boundaries[i]) {
        this.chengeBG(i);
        break;
      }
    }
  }

  /**
   * ナビゲーションにfixedクラスを付与   */
  setFixedClass() {
    const scrollTop = this.getScrollTop();
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
  getScrollTop() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return scrollTop;
  }

  /**
   * 背景色を変更する
   * @param {number} secNum
   */
  chengeBG(secNum: number) {
    //現在の番号
    let current = -1;
    if (secNum != current) {
      current = secNum;
      let transitionDuration = this.transitionDurationClassList.pc;
      if (this.touchDevice) {
        // タッチデバイス
        transitionDuration = this.transitionDurationClassList.mobile;
      }
      const allClassList: string[] = this.bgColorClassList.concat(Object.keys(this.transitionDurationClassList));
      allClassList.forEach((className) => {
        this.bodyElement.classList.remove(className);
      });
      [this.bgColorClassList[current], transitionDuration].forEach((className) => {
        this.bodyElement.classList.add(className);
      });
  }
  }

  /**
   * イベント付与メソッドをまとめて実行
   */
  addEvents() {
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
        this.scrollTopLast = this.getScrollTop();
        this.setBG();
        this.setFixedClass();
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
      this.setBG();
      this.setFixedClass();
    });
  }

  /**
   * スライダーの左右キー押下に応じたイベントを付与する
   */
  addEventArrowKeyDown() {
    document.addEventListener('keydown', (event) => {
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
