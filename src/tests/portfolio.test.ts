import Portfolio from '../js/portfolio';

let portfolio = new Portfolio();
describe('portfolio', (): void => {
    /**
     * 各要素の背景色が変わる境界位置を求めるメソッドのテスト
     */    
     describe('getBoundaries()', (): void => {
        it('getBoundaries', async () => {
            // テスト対象の要素の宣言と必要なメンバ変数を設定する
            document.body.innerHTML =
            '<div id="section1" class="section" style="height: 100px">' +
            '</div>' + 
            '<div id="section2" class="section" style="height: 100px">' +
            '</div>';
            portfolio.touchDevice = true;
            const targets = document.querySelectorAll!('.section');
    
            // getBoundingClientRectをモックする
            Element.prototype.getBoundingClientRect = jest.fn()
            .mockReturnValueOnce({top: 0} as DOMRect)
            .mockReturnValue({top: 101} as DOMRect);
            // この書き方でもOK
            // jest.spyOn(Element.prototype, 'getBoundingClientRect')
    
            // 期待値と比較する
            const results: number[] = portfolio.getBoundaries(targets);
            expect(Element.prototype.getBoundingClientRect).toBeCalled();
            expect(results[0]).toBe(0);
            expect(results[1]).toBe(101);
        });
     })
})
