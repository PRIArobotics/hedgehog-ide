
import { Directive, HostBinding, HostListener } from "@angular/core";

@Directive({
    selector: '[collapse-on-click]'
})

export class CollapseOnClick {

    isCollapsed = false;

    @HostBinding("class.collapsed")
    get collapsed(){
        return this.isCollapsed;
    }

    @HostListener('click')
    toggle() {
        this.isCollapsed = !this.isCollapsed;
    }
}