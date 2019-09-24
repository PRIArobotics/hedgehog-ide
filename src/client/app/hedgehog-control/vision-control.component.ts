import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SafeUrl} from "@angular/platform-browser";

import {VisionChannelKind} from "./http-hedgehog-client.service";

@Component({
    selector: 'vision-control',
    template: require('./vision-control.component.html'),
    styles: [require('./vision-control.component.css')]
})
export default class VisionControlComponent {
    @Input() public name: string;
    @Input() public frameUrl: SafeUrl;
    @Input() public channel: VisionChannelKind;
    @Input() public blobsRange: [[number, number, number], [number, number, number]];

    @Output() private channelChanged = new EventEmitter();
    @Output() private blobsRangeChanged = new EventEmitter();

    private VisionChannelKind = VisionChannelKind;

    public constructor () {}

    private updateChannel (channel) {
        this.channel = channel;
        this.channelChanged.emit(channel);
    }

    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the OpenCV color space:
     * h is in [0-179], s and v are in [0-255].
     *
     * @see https://gist.github.com/mjackson/5311256
     */
    static rgb2hsv(rgb: [number, number, number]): [number, number, number] {
        let [r, g, b] = rgb;
        r /= 255;
        g /= 255;
        b /= 255;

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

        return [Math.round(h*179), Math.round(s*255), Math.round(v*255)];
    }

    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @see https://gist.github.com/mjackson/5311256
     */
    static hsv2rgb(hsv: [number, number, number]): [number, number, number] {
        let [h, s, v] = hsv;
        h /= 179;
        s /= 255;
        v /= 255;

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

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    private setBlobChannelRangeFromRgb(rgb: [number, number, number]) {
        let [h, s, v] = VisionControlComponent.rgb2hsv(rgb);

        const range = (value, min, max, down, up) => [Math.max(min, value + down), Math.min(max, value + up)];

        let [hMin, hMax] = range(h, 0-20, 255+20, -20, +20);
        let [sMin, sMax] = range(s, 20, 255, -30, +30);
        let [vMin, vMax] = range(v, 20, 255, -30, +30);

        if (hMin < 0) hMin += 256;
        if (hMax >= 256) hMax -= 256;

        const packColor = (h, s, v) => h << 16 | s << 8 | v << 0;

        this.blobsRange = [[hMin, sMin, vMin], [hMax, sMax, vMax]];
        this.blobsRangeChanged.emit(this.blobsRange);
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
        let rgb = [...rgba.slice(0, 3)] as any;

        console.log(x, y, rgb, VisionControlComponent.rgb2hsv(rgb));
        this.setBlobChannelRangeFromRgb(rgb);
    }
}
