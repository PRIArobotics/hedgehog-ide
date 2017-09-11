import {Component, EventEmitter, Output, ElementRef, Input} from '@angular/core';

declare var ace: any;

/**
 * Thanks to fxmontigny
 * https://github.com/fxmontigny/ng2-ace-editor/blob/master/src/component.ts
 *
 * changed theme and mode
 */

/* tslint:disable */

@Component({
    selector: 'ace-editor',
    template: '',
    styles: [':host { display:block;width:100%; }']
})
export class AceEditorComponent {
    @Output('textChanged') textChanged = new EventEmitter();
    @Output('changeDelta') changeDelta = new EventEmitter();
    @Input('style') style: any = {};
    _options: any = {};
    _readOnly: boolean = false;
    _theme: string = "textmate";
    _mode: any = "python";
    _autoUpdateContent: boolean = true;
    _editor: any;
    _durationBeforeCallback: number = 0;
    oldText: any;
    timeoutSaving: any;

    constructor(elementRef: ElementRef) {
        ace.config.set("basePath", "/ace");

        let el = elementRef.nativeElement;
        this._editor = ace["edit"](el);

        this.init();
        this.initEvents();

        this._editor.$blockScrolling = Infinity;
    }

    init() {
        this.setOptions(this._options || {});
        this.setTheme(this._theme);
        this.setMode(this._mode);
        this.setReadOnly(this._readOnly);
    }

    initEvents() {
        const update = () => {
            let newVal = this._editor.getValue();
            if (newVal === this.oldText) return;
            if (typeof this.oldText !== 'undefined') {
                if (this._durationBeforeCallback == 0)
                    this.textChanged.emit(newVal);
                else {
                    if (this.timeoutSaving != null)
                        clearTimeout(this.timeoutSaving);

                    this.timeoutSaving = setTimeout(() => {
                        this.textChanged.emit(newVal);
                        this.timeoutSaving = null;
                    }, this._durationBeforeCallback);
                }
            }
            this.oldText = newVal;
        };

        this._editor.on('change', delta => {
            update();
            if (this._editor.curOp && this._editor.curOp.command.name)
                this.changeDelta.emit(delta);
        });

        this._editor.on('paste', () => {
            update();
        })
    }

    @Input() set options(options: any) {
        this.setOptions(options);
    }

    setOptions(options: any) {
        this._options = options;
        this._editor.setOptions(options || {});
    }

    @Input() set readOnly(readOnly: any) {
        this.setReadOnly(readOnly);
    }

    setReadOnly(readOnly: any) {
        this._readOnly = readOnly;
        this._editor.setReadOnly(readOnly);
    }

    @Input() set theme(theme: any) {
        this.setTheme(theme);
    }

    setTheme(theme: any) {
        this._theme = theme;
        this._editor.setTheme(`ace/theme/${theme}`);
    }

    @Input() set mode(mode: any) {
        this.setMode(mode);
    }

    setMode(mode: any) {
        this._mode = mode;
        if (typeof this._mode == 'object') {
            this._editor.getSession().setMode(this._mode);
        }
        else {
            this._editor.getSession().setMode(`ace/mode/${this._mode}`);
        }
    }

    @Input() set text(text: any) {
        this.setText(text);
    }

    setText(text: any) {
        if (text == null)
            text = "";

        if (this._autoUpdateContent == true) {
            this._editor.setValue(text);
            this._editor.clearSelection();
            this._editor.focus();
        }
    }

    @Input() set autoUpdateContent(status: any) {
        this.setAutoUpdateContent(status);
    }

    setAutoUpdateContent(status: any) {
        this._autoUpdateContent = status;
    }

    @Input() set durationBeforeCallback(num: number) {
        this.setDurationBeforeCallback(num);
    }

    setDurationBeforeCallback(num: number) {
        this._durationBeforeCallback = num;
    }

    getEditor() {
        return this._editor;
    }
}
