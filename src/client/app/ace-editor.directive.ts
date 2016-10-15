import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

import 'brace';
import 'brace/mode/python';
import 'brace/theme/chrome';
import 'brace/theme/tomorrow_night';
declare var ace: any;

@Directive({
    selector: '[ace-editor]'
})
export class AceEditorDirective {
    public editor: any;
    public oldVal: any;


    @Output() public textChanged = new EventEmitter();
    @Output() public editorRef = new EventEmitter();


    private readOnly: any;
    private theme: any;
    private mode: any;

    @Input() set options(value) {
        this.editor.setOptions(value || {});
    }

    @Input() set readOnly(value) {
        this.readOnly = value;
        this.editor.setReadOnly(value);
    }

    @Input() set theme(value) {
        this.theme = value;
        this.editor.setTheme(`ace/theme/${value}`);
    }

    @Input() set mode(value) {
        this.mode = value;
        this.editor.getSession().setMode(`ace/mode/${value}`);
    }

    @Input() set text(value) {
        if(value === this.oldVal) return;
        this.editor.setValue(value);
        this.editor.clearSelection();
        this.editor.focus();
    }

    constructor(private elementRef: ElementRef) {
        const el = elementRef.nativeElement;
        el.classList.add('editor');

        this.editor = ace.edit(el);

        setTimeout(() => {
            this.editorRef.next(this.editor);
        });

        this.editor.on('change', () => {
            const newVal = this.editor.getValue();
            if(newVal === this.oldVal) return;
            if(typeof this.oldVal !== 'undefined') {
                this.textChanged.next(newVal);
            }
            this.oldVal = newVal;
        });
    }
}
