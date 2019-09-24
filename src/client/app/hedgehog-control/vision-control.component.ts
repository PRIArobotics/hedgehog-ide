import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";

import {VisionChannelKind} from "./http-hedgehog-client.service";

export type HSV = [number, number, number];
export type HSVRange = [HSV, HSV];
export type RGB = [number, number, number];

@Component({
    selector: 'vision-control',
    template: require('./vision-control.component.html'),
    styles: [require('./vision-control.component.css')]
})
export default class VisionControlComponent {
    @Input() public name: string;
    @Input() public frameUrl: SafeUrl;
    @Input() public channel: VisionChannelKind;
    @Input() public blobsRange: HSVRange;

    @Output() private channelChanged = new EventEmitter();
    @Output() private blobsRangeChanged = new EventEmitter();

    @ViewChild('canvas') private canvas;

    private VisionChannelKind = VisionChannelKind;

    public constructor () {}

    ngAfterViewInit() {
        this.paintCanvas();
    }

    private updateChannel (channel) {
        this.channel = channel;
        this.channelChanged.emit(channel);
    }

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * All values are in [0, 1].
     *
     * @see https://gist.github.com/mjackson/5311256
     */
    static rgb2hsv(rgb: RGB): HSV {
        let [r, g, b] = rgb;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let d = max - min;

        let h, s, v = max;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return [h, s, v];
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * All values are in [0, 1].
     *
     * @see https://gist.github.com/mjackson/5311256
     */
    static hsv2rgb(hsv: HSV): RGB {
        let [h, s, v] = hsv;

        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return [r, g, b];
    }

    public float2byte(x: number): number {
        return Math.round(x*255);
    }

    private setBlobsRange(range: HSVRange) {
        this.blobsRange = range;
        this.blobsRangeChanged.emit(range);
        this.paintCanvas();
    }

    private setBlobsRangeFromRgb(rgb: RGB) {
        let [h, s, v] = VisionControlComponent.rgb2hsv(rgb);

        const range = (value, min, max, down, up) => [Math.max(min, value + down), Math.min(max, value + up)];

        let [hMin, hMax] = range(h, 0-20/255, 1+20/255, -20/255, +20/255);
        let [sMin, sMax] = range(s, 20/255, 255/255, -30/255, +30/255);
        let [vMin, vMax] = range(v, 20/255, 255/255, -30/255, +30/255);

        if (hMin < 0) hMin += 1;
        if (hMax >= 1) hMax -= 1;

        this.setBlobsRange([[hMin, sMin, vMin], [hMax, sMax, vMax]]);
    }

    private clickImage (event) {
        let img = event.target;

        let rect = img.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        let rgba = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        let rgb: RGB = [rgba[0]/255, rgba[1]/255, rgba[2]/255];

        this.setBlobsRangeFromRgb(rgb);
    }

    private paintCanvas() {
        let ctx = this.canvas.nativeElement.getContext('2d');

        let [[hMin, sMin, vMin], [hMax, sMax, vMax]] = this.blobsRange;
		let hBias = hMin < hMax? (hMin+hMax)/2 : (hMin+hMax+1)/2;

        const h2x = h => ((h - hBias + 3/2) % 1)*360;
        const s2y = s => s * 100;
        const v2y = v => 199 - v * 100;

        const x2h = x => (x/360 + hBias + 1/2) % 1;
        const y2sv = y => y < 100 ? [y / 100, 1] : [1, (199 - y) / 100];

		for(let x = 0; x < 360; x++) {
			for(let y = 0; y < 200; y++) {
			    let hsv = [x2h(x), ...y2sv(y)] as HSV;
				let [r, g, b] = VisionControlComponent.hsv2rgb(hsv);
				ctx.fillStyle = `rgb(${this.float2byte(r)}, ${this.float2byte(g)}, ${this.float2byte(b)})`;
				ctx.fillRect(x, y, 1, 1);
			}
		}

		ctx.lineWidth = 2;
		const r = 8;

		let x1, x2, y1, y2;
		x1 = h2x(hMin);
		x2 = h2x(hMax);

		y1 = s2y(sMin);
		y2 = s2y(sMax);

		ctx.strokeStyle = 'gray';
		ctx.strokeRect(x1, y1, x2-x1, y2-y1);
		ctx.strokeRect(x1-r, y1-r, 2*r, 2*r);
		ctx.strokeRect(x2-r, y2-r, 2*r, 2*r);

		y1 = v2y(vMin);
		y2 = v2y(vMax);
		ctx.strokeStyle = 'lightgray';
		ctx.strokeRect(x1, y1, x2-x1, y2-y1);
		ctx.strokeRect(x2-r, y1-r, 2*r, 2*r);
		ctx.strokeRect(x1-r, y2-r, 2*r, 2*r);
    }
}
