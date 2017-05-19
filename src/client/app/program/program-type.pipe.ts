import {Pipe, PipeTransform} from "@angular/core";
import {default as Program} from "../../../common/versioncontrol/Program";

@Pipe({
    name: 'programType'
})
export default class ProgramTypePipe implements PipeTransform {
    public transform(programs: string[] = [], types: string[]): any {
        return programs.filter(program => types.indexOf(Program.getExtension(program)) !== -1);
    }
}
