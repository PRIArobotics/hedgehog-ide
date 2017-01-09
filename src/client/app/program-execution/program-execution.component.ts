
import {Component} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'program-execution',
    templateUrl: 'program-execution.component.html',
    styleUrls: ['program-execution.component.css'],
})
export class ProgramExecutionComponent {
    public isRunning: boolean = false;
}
