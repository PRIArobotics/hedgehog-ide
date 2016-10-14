import { Directive } from '@angular/core';


@Directive({
    selector: '[draggable]'
})

export class DragDirective {

    constructor() {
        $(function() {
            var tabs = (<any>$("#sortable-tabs"));
            tabs.sortable({
                "items": "li",
                "axis": "x",
                "start": function (event, ui) {
                    ui.item.startPos = ui.item.index();
                }
            });
            tabs.disableSelection();
        });
    }
}