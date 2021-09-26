import SliderImpl from './slider';
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
  navi: HTMLElement;
  slider: any;

  constructor() {
    this.scrollTopLast = 0; // 1つ前のスクロール位置(スクロール方向判定用)
    this.touchDevice = this.isTouchDevice();
    this.bodyElement = document.querySelector('body')!;
    this.wrapper = this.bodyElement.querySelector('#wrapper')!;
    this.sections = this.bodyElement.querySelectorAll('div.section');
    this.introduction = this.bodyElement.querySelector('#introduction')!;
    this.navi = this.bodyElement.querySelector('#globalNavi')!;
    this.boundaries = this.getBoundaries(this.sections);
    this.setBG();
    this.addEvents();
    this.setSliderProp(this.bodyElement.querySelector('#profile')!, SlideContents);
    this.hideLoadingAnime('#bg-photo', '#preLoading');
  }

  /**
   * トップの背景画像読み込み完了時に読み込み中アニメーションを非表示
   */
  hideLoadingAnime(target: string, loader: string) {
    const imgPass = 'dist/img/';
    const targetElem: HTMLElement = document.body.querySelector(target)!;
    const loaderElem: HTMLElement = document.body.querySelector(loader)!;
    if(targetElem) {
      let url: string =
      targetElem.style.backgroundImage ||
        window.getComputedStyle(targetElem, '')[<any>'background-image'];
      url = url.replace(/^url.+?img\/([^/]+?)"\)/, '$1').replace(/(.+?)$/, imgPass + '$1');
      const img = document.createElement('img');
      img.src = url;
      img.width = img.height = 1;
      document.body.appendChild(img);
      img.onload = () => {
        loaderElem.style.display = 'none';
        document.body!.removeChild(img);
      };
    }
  } 

  /**
   * スライダークラスの呼び出し
   * @param {obj} target スライダーを表示するエレメント
   * @param {number} ms オートプレイのスピード
   */
  setSliderProp(target: HTMLElement, slideContents: any[]): void {
    const ms = 5000;
    const dispTileList = false;
    const loopLimit = 1;
    this.slider = new SliderImpl(target, slideContents, ms, loopLimit, dispTileList);
  }

  /**
   * 各要素の背景色が変わる境界位置を求める
   */
  getBoundaries(targets: NodeList): number[] {
    const boundaries: number[] = [];
    targets.forEach((elem : Node, i: number) => {
      const tmpElem = elem as HTMLElement;
      // ターゲット要素の座標位置を左上を0:0として取得する（現在のウィンドウサイズが最大）
      const rect : { [key: string]: any } = tmpElem.getBoundingClientRect();
      // 現在の垂直方向のスクロール量を取得する（documentの高さが最大）
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // ターゲット要素の縦方向の位置と現在のスクロール量を合算する
      const elemsTop = rect.top + scrollTop;
      // 最上部は0にする
      let boundary = 0;
      if (i > 0) {
        let referenceHeight = 40 + 20; // ナビゲーション+αの高さ
        if (this.touchDevice) {
          // タッチデバイス
          boundary = elemsTop;
        } else {
          // PC：上部navi領域-余白の高さ
          boundary = elemsTop - referenceHeight;
        }
      }
      // 背景色変更する位置に設定する
      boundaries.push(boundary);
    });
    return boundaries;
  }

  /**
   * 背景変更メソッドに渡すプロパティをセット、実行
   * @param {number} speed 変化速度
   */
  setBG(): void {
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
  setFixedClass(): void {
    const scrollTop = this.getScrollTop();
    const underNaviHeight = this.introduction.getBoundingClientRect().height;
    const adjuster = this.touchDevice ? -15 : -15;
    if (scrollTop < this.boundaries[1] - underNaviHeight + adjuster) {
      // スクロール位置がナビゲーションより上だったらfixedクラスを外す
      this.navi.classList.remove('fixed');
    } else {
      if (this.touchDevice) {
        if (scrollTop > this.scrollTopLast) {
          // モバイルで下向き移動の時はfixedクラスを外す
          this.navi.classList.remove('fixed');
        } else {
          // モバイル上向き移動の時はfixedにしてフェードインさせる
          this.navi.classList.add('fixed');
        }
      } else {
        // PCで2番目以降のエリアだったらfixedにする
        this.navi.classList.add('fixed');
      }
    }
  }

  /**
   * スクロール位置を取得する
   * @param {number} param
   * @return {number} scrollTop
   */
  getScrollTop(): number {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return scrollTop;
  }

  /**
   * 背景色を変更する
   * @param {number} secNum
   */
  chengeBG(secNum: number): void {
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
  addEvents(): void {
    this.addEventScrolle();
    this.addEventResize();
    this.addEventArrowKeyDown();
  }

  /**
   * スクロールに応じたイベントを付与する
   */
  addEventScrolle(): void {
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
  addEventResize(): void {
    window.addEventListener('resize', () => {
      this.boundaries = this.getBoundaries(this.sections);
      this.setBG();
      this.setFixedClass();
    });
  }

  /**
   * スライダーの左右キー押下に応じたイベントを付与する
   */
  addEventArrowKeyDown(): void {
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
  isTouchDevice(): boolean {
    if ('ontouchmove' in window) {
      return true;
    } else {
      return false;
    }
  }
}
