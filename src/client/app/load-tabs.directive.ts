import { Directive} from '@angular/core';


@Directive({
    selector: '[load-tabs]'
})

export class LoadTabs {
    constructor() {
        (<any>$("ul.tabs")).tabs();
    }
}
