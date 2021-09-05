import Slider from '../js/slider';
import SlideContents from '../js/self-introduction.json';

describe('portfolio', (): void => {
    test('can create a new slider', (): void => {
        const target: HTMLElement = document.createElement('div');
        const ms = 5000;
        const dispTileList = false;
        const loopLimit = 1;
        new Slider(target, SlideContents, ms, loopLimit, dispTileList);
    });
})