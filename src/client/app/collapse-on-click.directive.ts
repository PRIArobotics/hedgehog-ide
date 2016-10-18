
import { Directive, HostBinding, HostListener } from "@angular/core";

@Directive({
    selector: '[collapse-on-click]'
})

export class CollapseOnClick {

    public isCollapsed = false;

    @HostBinding("class.collapsed")
    get collapsed(){
        return this.isCollapsed;
    }

    @HostListener('click')
    public toggle() {
        this.isCollapsed = !this.isCollapsed;
    }
}
