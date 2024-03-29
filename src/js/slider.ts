interface Slider {
  new (target: HTMLElement, slideContents: any[], ms: Number, loopLimit: Number, dispTileList: boolean): SliderImpl;
}

/**
 * スライダークラス
 */
export default class SliderImpl {
  target: HTMLElement = <HTMLElement>document.createElement('div');
  slideContents: any[] = [];
  ms: number = 4500;
  loopLimit: number = 1;
  playSpeed : number = 5000;
  limit : number = 1;
  dispTitleList : boolean = false;
  screen : HTMLElement;
  prev : HTMLElement;
  next : HTMLElement;
  slideNaviList : HTMLElement;
  contentIdPrefix : string = 'slideContents_';
  clickBtn : boolean = true;                   // スライダーの左右の矢印を押下したフラグ
  current : number = 0;                        // 現在のスライド
  allSlideCount : number = 0;                  // スライドの総数
  playCount : number = 0;                      // オートプレイのカウント
  contents : HTMLElement[] = [];               // jsonからhtmlに変換後のslideContents
  listIdPrefix: string = 'slideLbl_';
  intarval: number = 0;
  touchStartX: number = 0;
  touchMoveX: number = 0;
  swipeDist: number = 30;

/**
   * constructor
   * @param {HTMLElement} target
   * @param {object} slideContents
   * @param {number} ms
   * @param {number} loopLimit
   * @param {boolean} dispTileList
   */
  constructor(target: HTMLElement, slideContents: any[], ms: number, loopLimit: number, dispTileList: boolean) {
    this.target = target;
    this.playSpeed = ms;
    this.limit = loopLimit;
    this.dispTitleList = dispTileList;
    this.screen = this.target.querySelector('.slideScreen')!;
    this.prev = this.target.querySelector('.slidePrev')!;
    this.next = this.target.querySelector('.slideNext')!;
    this.slideNaviList = this.target.querySelector('.slideNaviList')!;
    this.setSlider(slideContents).catch((error) => console.error(error.message));
  }

  /**
   * スライダーを作る
   * @param {obj} slideContents
   */
  async setSlider(slideContents: any[]) {
    this.maskSlideScreen();
    await this.onceLoadImg(slideContents);
    await this.convertToElem(slideContents);
    this.hideScreenLoader();
    this.setFirstContent(this.contents[0]);
    this.setPrevsEvent();
    this.setNextsEvent();
    this.addEventTouch();
    this.addEventScreenClick();
    this.addEventArrowKeyDown();
    this.autoPlay();
  }

  /**
   * スライダー表示エリアを読み込み中表示(ローダー)で隠す
   * @param {HTMLElement} toMask
   */
  maskSlideScreen() {
    this.screen.insertAdjacentHTML(
      'beforeend',
      '<div class="slide-contents-box box-for-loading"><div class="slideshow-loading-all">Loading...</div></div>'
    );
  }

  /**
   * 読み込み中表示を解除
   */
  hideScreenLoader() {
    let target = this.screen.querySelector<HTMLElement>('.box-for-loading')!;
    target.style.display = 'none';
  }

  /**
   * 全ページの画像を全て一度読み込む
   * @param {any[]} json
   */
  onceLoadImg(json: any[]) {
    const pathList = this.getImgPathList(JSON.parse(JSON.stringify(json)));
    pathList.forEach((path) => {
      const img = document.createElement('img');
      img.src = path;
      img.addEventListener(
        'load',
        () => {
          img.remove();
        },
        { once: true }
      );
    });
  }

  /**
   * json内の画像パスを全て取得する
   * @param {any[]} json
   * @return {array}
   */
  getImgPathList(json: any[]): string[] {
    const pathList: string[] = [];
    json.forEach((page) => {
      page.contents.forEach((part : { [key: string]: any }) => {
        if (part.styles) {
          if (Object.keys(part.styles).includes('background-image')) {
            let path = part.styles['background-image'];
            path = path.replace(/^url\(([^\\]+?.[a-z A-Z]+?)\)/, '$1');
            pathList.push(path);
            // this.setImgData(path);
          }
        }
      });
    });
    return pathList;
  }

  /**
   * JsonデータからHTMLエレメントを生成する
   * @param {any[]} json
   */
  convertToElem(json: any[]) {
    // タイトルリスト部分のスタイルを設定する
    if (this.dispTitleList) {
      this.slideNaviList.classList.add('titleList');
    } else {
      this.slideNaviList.classList.add('indicator');
    }

    json.forEach((page, i) => {
      // リストタグを作る
      const list = this.createNaviElem(page, i);

      // コンテンツ表示部分(外側)を作る
      let contentsBox = document.createElement('div');
      contentsBox.setAttribute('id', this.contentIdPrefix + String(i));
      contentsBox.classList.add('slide-contents-box');

      // コンテンツ表示部分(内側)を作る
      const contents = document.createElement('div');
      contents.classList.add('slide-contents');
      if (page.styles) {
        Object.keys(page.styles).forEach((styleName) => {
          contents.style.setProperty(styleName, page.styles[styleName], '');
        });
      }
      if (page.classes) {
        page.classes.forEach((child : string) => {
          contents.classList.add(child);
        });
      }

      // コンテンツを作る
      page.contents.forEach((part : { [key: string]: any }) => {
        let elem = this.buildElems(part);

        // 画像表示用の要素の場合
        if (elem.classList.contains('has-bg-img')) {
          // コンテナを作る
          const imgContainer = document.createElement('div');
          imgContainer.classList.add('img-container');
          // ローダーを付ける
          const loader = this.createLoader();
          imgContainer.appendChild(loader);
          imgContainer.appendChild(elem);
          elem = imgContainer;
        }
        contents.appendChild(elem);
      });

      // コンテンツ表示部分に格納する
      contentsBox.appendChild(contents);
      this.contents.push(contentsBox);

      // タイトルリストのクリックイベントを設定する
      this.setListClickEvent(list, i);
    });
    this.allSlideCount = this.contents.length;
  }

  /**
   * スライドのタイトルリストを作る
   * @param {{ [key: string]: any }} page
   * @param {Number} idx
   * @return {HTMLLIElement}
   */
  createNaviElem(page: { [key: string]: any }, idx: Number): HTMLLIElement {
    const list : HTMLLIElement = document.createElement('li');
    list.setAttribute('id', this.listIdPrefix + idx);
    if (!idx) {
      list.classList.add('selected');
    }
    if (this.dispTitleList) {
      list.textContent = page.title;
    }
    this.slideNaviList.appendChild(list);
    return list;
  }

  /**
   * スライダーメインコンテンツを作る
   * @param {{ [key: string]: any }} part
   * @return {HTMLElement}
   */
  buildElems(part: { [key: string]: any }): HTMLElement {
    if (!part.tag) {
      throw new Error('タグが指定されていません');
    }
    let elem = this.createTag(part);
    // スタイルを付与する
    if (this.hasProperty(part, 'styles')) {
      Object.keys(part.styles).forEach((styleName) => {
        elem.style.setProperty(styleName, part.styles[styleName], '');
      });
    }
    // クラスを付与する
    if (this.hasProperty(part, 'classes')) {
      part.classes.forEach((child : string) => {
        elem.classList.add(child);
      });
    }
    return elem;
  }

  /**
   * 指定されたタグを生成する
   * @param {obj} part
   * @return {HTMLElement}
   */
  createTag(part: { [key: string]: any }): HTMLElement {
    // tagで指定された要素を作る
    let elem : HTMLElement;
    switch (part.tag) {
      case 'dl':
        elem = document.createElement(part.tag);
        part.list.forEach((child : { [key: string]: any }) => {
          const div = document.createElement('div');
          const dt = document.createElement('dt');
          const dd = document.createElement('dd');
          dt.textContent = child.dt;
          dd.textContent = child.dd;
          div.appendChild(dt);
          div.appendChild(dd);
          elem.appendChild(div);
        });
        break;
      case 'ul':
        elem = document.createElement(part.tag);
        part.list.forEach((child : string) => {
          const li = document.createElement('li');
          li.textContent = child;
          elem.appendChild(li);
        });
        break;
      case 'ol':
        elem = document.createElement(part.tag);
        part.list.forEach((child : string) => {
          const li = document.createElement('li');
          li.textContent = child;
          elem.appendChild(li);
        });
        break;
      case 'img':
        // 背景画像ありのdivにする
        elem = document.createElement('div');
        elem.style.setProperty('background-image', 'url(' + part.src + ')');
        elem.style.setProperty('display', 'none', '');
        // 背景画像用のクラス、ロード時の監視対象クラスを付与
        elem.classList.add('has-bg-img', 'toBeMonitored');
        break;
      case 'div':
        elem = document.createElement(part.tag);
        // 背景画像ありの場合
        if (this.hasProperty(part.styles, 'background-image')) {
          // 背景画像用のクラス、ロード時の監視対象のクラスを付与
          elem.classList.add('has-bg-img', 'toBeMonitored');
          elem.style.setProperty('display', 'none', '');
        }
        // textContentを挿入
        if (part.textContent) elem.insertAdjacentHTML('beforeend', part.textContent);
        break;
      default:
        elem = document.createElement(part.tag);
        if (part.textContent) elem.insertAdjacentHTML('beforeend', part.textContent);
        break;
    }
    return elem;
  }

  /**
   * JsonデータからHTMLエレメントを生成する
   * @param {HTMLElement} page
   */
  setFirstContent(page: HTMLElement) {
    this.screen.appendChild(page);
    this.hideLoader();
  }

  /**
   * list押下時のイベントをセット
   * @param {HTMLLIElement} list
   * @param {number} length
   * @param {number} showTarget
   * @param {number} hideTarget
   */
  setListClickEvent(list: HTMLLIElement, showTarget: number) {
    list.addEventListener('click', () => {
      for (let j = 0; j < this.slideNaviList.children.length; j++) {
        this.slideNaviList.children[j].classList.remove('selected');
      }
      list.classList.add('selected');
      this.current = parseInt(list.id.split('_')[1]);

      this.setScreenStyleBefore();
      this.screen.textContent = null;
      this.screen.appendChild(this.contents[showTarget]);
      this.changeScreenStyle();
      this.hideLoader();
    });
  }

  /**
   * prev押下時のイベントをセット
   */
  setPrevsEvent() {
    this.prev.addEventListener('click', () => {
      if (this.clickBtn === true) {
        this.clickBtn = false;
        this.setScreenStyleBefore();

        this.slideNaviList.children[this.current].classList.remove('selected');
        this.current--;
        if (this.current < 0) {
          this.current = this.contents.length - 1;
        }
        this.slideNaviList.children[this.current].classList.add('selected');

        this.screen.textContent = null;
        this.screen.appendChild(this.contents[this.current]);
        this.changeScreenStyle();
        this.hideLoader();
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
        this.setScreenStyleBefore();

        this.slideNaviList.children[this.current].classList.remove('selected');
        this.current++;
        if (this.current > this.contents.length - 1) {
          this.current = 0;
        }
        this.slideNaviList.children[this.current].classList.add('selected');

        this.screen.textContent = null;
        this.screen.appendChild(this.contents[this.current]);
        this.changeScreenStyle();
        this.hideLoader();
      } else {
        return false;
      }
    });
  }

  /**
   * スライド部分の変化直前スタイル
   */
  setScreenStyleBefore() {
    this.clickBtn = true;
    this.screen.style.opacity = '0.2';
    this.screen.style.transitionDuration = '';
  }

  /**
   * スライド部分のリストor矢印クリック時のスタイル
   */
  changeScreenStyle() {
    setTimeout(() => {
      this.screen.style.opacity = '1';
      this.screen.style.transitionDuration = '700ms';
      this.clickBtn = true;
    }, 20);
  }

  /**
   * オートプレイ
   */
  autoPlay() {
    if (this.limit > 0) {
      this.intarval = window.setInterval(() => {
        this.next.click();
        this.playCount++;
        if (this.limit * this.allSlideCount <= this.playCount) {
          clearInterval(this.intarval);
        }
      }, this.playSpeed);
    }
  }

  /**
   * スワイプに応じたイベントを付与する
   */
  addEventTouch() {
    this.screen.addEventListener(
      'touchstart',
      (event) => {
        this.touchStartX = event.changedTouches[0].pageX;
      },
      { passive: true }
    );
    this.screen.addEventListener(
      'touchmove',
      (event) => {
        this.touchMoveX = event.changedTouches[0].pageX;
      },
      { passive: true }
    );
    this.screen.addEventListener(
      'touchend',
      () => {
        this.swipeDist = 30;
        // 方向判定&移動量判定
        if (
          this.touchStartX > this.touchMoveX &&
          this.touchStartX > this.touchMoveX - this.swipeDist
        ) {
          this.next.click();
        } else if (
          this.touchStartX < this.touchMoveX &&
          this.touchStartX < this.touchMoveX + this.swipeDist
        ) {
          this.prev.click();
        }
      },
      { passive: true }
    );
  }

  /**
   * スクリーンクリック時のイベントを付与する
   */
  addEventScreenClick() {
    this.screen.addEventListener(
      'click',
      () => {
        // オートプレイ中だったら止める
        if (this.limit && this.limit * this.allSlideCount >= this.playCount) {
          clearInterval(this.intarval);
        }
      },
      { passive: true }
    );
  }

  /**
   * スライダーの左右キー押下に応じたイベントを付与する
   */
  addEventArrowKeyDown() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        this.next.click();
      } else if (event.key === 'ArrowLeft') {
        this.prev.click();
      }
    });
  }

  /**
   * ローダーを付与する
   * @return {HTMLElement}
   */
  createLoader(): HTMLElement {
    let elem = document.createElement('div');
    elem.classList.add('slide-show_preLoading');
    elem.style.setProperty('display', 'block', '');
    elem.insertAdjacentHTML('beforeend', 'Loading...');
    return elem;
  }

  /**
   * 背景画像読み込み完了時に読み込み中アニメーションを非表示(個別画像用)
   */
  hideLoader() {
    const bgPhotos = this.screen.querySelectorAll('.toBeMonitored');
    bgPhotos.forEach((bgPhoto : any) => {
      let url = bgPhoto.style.getPropertyValue('background-image');
      if (url !== '') {
        url = url.replace(/^url\("(.+?)"\)/, '$1').replace(/(.+?)$/, '$1');
      }
      const img = document.createElement('img');
      img.src = url;
      img.width = img.height = 1;
      img.onload = () => {
        img.remove();
        // .slide-show_preLoadingで隠れていた要素
        const nextElem = bgPhoto.previousElementSibling!;
        nextElem.style.display = 'none';
        bgPhoto.style.display = '';
      };
    });
  }

  /**
   * プロパティの存在チェック
   * @param {obj} obj
   * @param {str} key
   * @return {bool}
   */
  hasProperty(obj: { [key: string]: any }, key: string): boolean {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }
}
