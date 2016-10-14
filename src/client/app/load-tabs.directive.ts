import { Directive, ElementRef, Renderer } from '@angular/core';


@Directive({
    selector: '[load-tabs]'
})

export class LoadTabs {
    constructor(private el: ElementRef, private renderer: Renderer) {
        console.log(this.el.nativeElement);
        (<any>$("ul.tabs")).tabs();
    }
}