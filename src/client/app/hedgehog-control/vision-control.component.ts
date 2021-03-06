import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";

import {VisionChannelKind} from "./http-hedgehog-client.service";

export type HSV = [number, number, number];
export type HSVRange = [HSV, HSV];
export type RGB = [number, number, number];

enum DragPoint {
    HS_TL,
    HS_BR,
    HV_TL,
    HV_BR,
}

@Component({
    selector: 'vision-control',
    template: require('./vision-control.component.html'),
    styles: [require('./vision-control.component.css')]
})
export default class VisionControlComponent {
    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * All values are in [0, 1].
     *
     * @see https://gist.github.com/mjackson/5311256
     */
    public static rgb2hsv(rgb: RGB): HSV {
        let [r, g, b] = rgb;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let d = max - min;

        let h;
        let s = max === 0 ? 0 : d / max;
        let v = max;

        if (max === min) {
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
    public static hsv2rgb(hsv: HSV): RGB {
        let [h, s, v] = hsv;

        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        // tslint:disable-next-line one-variable-per-declaration
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

    @Input() public name: string;
    @Input() public frameUrl: SafeUrl;
    @Input() public channel: VisionChannelKind;
    @Input() public blobsRange: HSVRange;

    @Output() public channelChanged = new EventEmitter();
    @Output() public blobsRangeChanged = new EventEmitter();

    @ViewChild('canvas') public canvas;
    public canvasDragInfo: {
        dragPoint: DragPoint;
        hBias: number;
        range: HSVRange;
    } | null = null;

    public chooser = {
        width: 360,
        height: 200,
        border: 3,
    };

    public VisionChannelKind = VisionChannelKind;

    public float2byte(x: number): number {
        return Math.round(x*255);
    }

    public ngAfterViewInit() {
        let canvas = this.canvas.nativeElement;

        let { width, height } = this.chooser;
        canvas.offscreenCanvas = document.createElement('canvas');
        canvas.offscreenCanvas.width = 2*width;
        canvas.offscreenCanvas.height = height;
        this.paintBackground();

        this.paintCanvas();
    }

    private updateChannel (channel) {
        this.channel = channel;
        this.channelChanged.emit(channel);
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

    private paintBackground() {
        let canvas = this.canvas.nativeElement.offscreenCanvas;
        let ctx = canvas.getContext('2d');

        let { width, height } = this.chooser;

        const x2h = x => (x / width + 1 / 2) % 1;
        const y2sv = y => y < height / 2 ? [y / (height / 2), 1] : [1, (height - 1 - y) / (height / 2)];

        for (let x = 0; x < 2 * width; x++) {
            for (let y = 0; y < height; y++) {
                let hsv = [x2h(x), ...y2sv(y)] as HSV;
                let [r, g, b] = VisionControlComponent.hsv2rgb(hsv);
                ctx.fillStyle = `rgb(${this.float2byte(r)}, ${this.float2byte(g)}, ${this.float2byte(b)})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    private paintCanvas() {
        let canvas = this.canvas.nativeElement;
        let ctx = canvas.getContext('2d');
        let { width, height, border } = this.chooser;

        // tslint:disable-next-line one-variable-per-declaration
        let hMin, sMin, vMin, hMax, sMax, vMax, hBias;
        if (this.canvasDragInfo !== null) {
            [[hMin, sMin, vMin], [hMax, sMax, vMax]] = this.canvasDragInfo.range;
            hBias = this.canvasDragInfo.hBias;
        } else {
            [[hMin, sMin, vMin], [hMax, sMax, vMax]] = this.blobsRange;
            hBias = hMin < hMax ? (hMin + hMax) / 2 : (hMin + hMax + 1) / 2;
        }

        const h2x = h => ((h - hBias + 3 / 2) % 1) * width + border;
        const s2y = s => s * (height / 2) + border;
        const v2y = v => height - 1 - v * (height / 2) + border;

        // draw a background for additional drag area
        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw the palette, clipped into the border
        ctx.save();
        ctx.rect(border, border, width, height);
        ctx.clip();

        let xBias = h2x(0) - width / 2;
        if (xBias > 0) xBias -= width;
        ctx.drawImage(this.canvas.nativeElement.offscreenCanvas, xBias + border, border);
        ctx.restore();

        ctx.lineWidth = 2;
        const r = 8;

        // tslint:disable-next-line one-variable-per-declaration
        let x1, x2, y1, y2;
        x1 = h2x(hMin);
        x2 = h2x(hMax);

        y1 = s2y(sMin);
        y2 = s2y(sMax);

        ctx.strokeStyle = 'gray';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x1 - r, y1 - r, 2 * r, 2 * r);
        ctx.strokeRect(x2 - r, y2 - r, 2 * r, 2 * r);

        y1 = v2y(vMin);
        y2 = v2y(vMax);
        ctx.strokeStyle = 'lightgray';
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.strokeRect(x2 - r, y1 - r, 2 * r, 2 * r);
        ctx.strokeRect(x1 - r, y2 - r, 2 * r, 2 * r);
    }

    private canvasMouseDown(event) {
        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        let { width, height, border } = this.chooser;

        // tslint:disable-next-line one-variable-per-declaration
        const x = event.clientX - rect.left, y = event.clientY - rect.top;

        let [[hMin, sMin, vMin], [hMax, sMax, vMax]] = this.blobsRange;
        // denormalize hue value to preserve the direction of the selection
        if (hMax < hMin) hMax += 1;
        let hBias = (hMin+hMax)/2;

        const h2x = h => ((h - hBias + 3/2) % 1)*width + border;
        const s2y = s => s * (height/2) + border;
        const v2y = v => height-1 - v * (height/2) + border;

        const r = 8;
        const inRange = (val, target) => target - r <= val && val <= target + r;

        let dragPoint: DragPoint;
        if (inRange(x, h2x(hMin))) {
            if (inRange(y, s2y(sMin))) {
                dragPoint = DragPoint.HS_TL;
            } else if (inRange(y, v2y(vMax))) {
                dragPoint = DragPoint.HV_TL;
            } else return;
        } else if (inRange(x, h2x(hMax))) {
            if (inRange(y, s2y(sMax))) {
                dragPoint = DragPoint.HS_BR;
            } else if (inRange(y, v2y(vMin))) {
                dragPoint = DragPoint.HV_BR;
            } else return;
        } else return;


        this.canvasDragInfo = {
            dragPoint,
            hBias,
            range: [[hMin, sMin, vMin], [hMax, sMax, vMax]],
        };

        this.setDragRange(x, y);
    }

    private canvasMouseMove(event) {
        if (this.canvasDragInfo === null)
            return;

        const canvas = event.target;
        const rect = canvas.getBoundingClientRect();
        // tslint:disable-next-line one-variable-per-declaration
        const x = event.clientX - rect.left, y = event.clientY - rect.top;

        this.setDragRange(x, y);
    }

    private setDragRange(x: number, y: number) {
        let { width, height, border } = this.chooser;

        let { dragPoint, hBias, range } = this.canvasDragInfo;

        // don't wrap to preserve the direction of the selection
        // tslint:disable-next-line no-shadowed-variable
        const x2h = x => ((x-border)/width + hBias - 1/2);

        // tslint:disable-next-line no-shadowed-variable
        const y2sv = y => (y-border) < height/2 ?
            [(y-border) / (height/2), 1] :
            [1, (height-1 - (y-border)) / (height/2)];

        // tslint:disable-next-line one-variable-per-declaration
        let h = x2h(x), [s, v] = y2sv(y);

        const limit = (val, min, max) => Math.max(min, Math.min(max, val));
        s = limit(s, 0, 1);
        v = limit(v, 0, 1);

        let [[hMin, sMin, vMin], [hMax, sMax, vMax]] = range;
        switch (dragPoint) {
            case DragPoint.HS_TL: hMin = h; sMin = s; break;
            case DragPoint.HV_TL: hMin = h; vMax = v; break;
            case DragPoint.HS_BR: hMax = h; sMax = s; break;
            case DragPoint.HV_BR: hMax = h; vMin = v; break;
        }
        this.canvasDragInfo.range = [[hMin, sMin, vMin], [hMax, sMax, vMax]];
        this.paintCanvas();
    }

    private canvasMouseUp(event) {
        if (this.canvasDragInfo === null)
            return;

        let [[hMin, sMin, vMin], [hMax, sMax, vMax]] = this.canvasDragInfo.range;
        if (hMin > hMax) [hMin, hMax] = [hMax, hMin];
        // normalize hue value
        hMin -= Math.floor(hMin);
        hMax -= Math.floor(hMax);
        if (sMin > sMax) [sMin, sMax] = [sMax, sMin];
        if (vMin > vMax) [vMin, vMax] = [vMax, vMin];
        this.canvasDragInfo = null;
        this.setBlobsRange([[hMin, sMin, vMin], [hMax, sMax, vMax]]);
    }
}
