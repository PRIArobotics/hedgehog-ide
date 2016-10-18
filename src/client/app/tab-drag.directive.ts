import { Directive } from '@angular/core';

@Directive({
    selector: '[draggable]'
})

export class DragDirective {

    constructor() {
        $(() => {
            const tabs = (<any>$("#sortable-tabs"));
            tabs.sortable({
                items: "li",
                axis: "x"
            });
            tabs.disableSelection();
        });
    }
}
