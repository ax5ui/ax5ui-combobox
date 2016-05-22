/*
 * Copyright (c) 2016. tom@axisj.com
 * - github.com/thomasjang
 * - www.axisj.com
 */

// ax5.ui.combobox
(function (root, _SUPER_) {

    /**
     * @class ax5.ui.combobox
     * @classdesc
     * @version 0.0.1
     * @author tom@axisj.com
     * @example
     * ```
     * var mycombobox = new ax5.ui.combobox();
     * ```
     */
    var U = ax5.util;

    //== UI Class
    var axClass = function () {
        var
            self = this,
            cfg;

        if (_SUPER_) _SUPER_.call(this); // 부모호출

        this.instanceId = ax5.getGuid();
        this.queue = [];
        this.config = {
            theme: 'default',
            animateTime: 250,
            lang: {
                noSelected: '',
                noOptions: 'no options',
                loading: 'now loading..'
            },
            columnKeys: {
                optionValue: 'value',
                optionText: 'text',
                optionSelected: 'selected'
            }
        };

        this.activecomboboxOptionGroup = null;
        this.activecomboboxQueueIndex = -1;
        this.openTimer = null;
        this.closeTimer = null;
        this.waitOptionsCallback = null;
        this.keyUpTimer = null;

        cfg = this.config;

        var
            ctrlKeys = {
                "18": "KEY_ALT",
                "8": "KEY_BACKSPACE",
                "17": "KEY_CONTROL",
                "46": "KEY_DELETE",
                "40": "KEY_DOWN",
                "35": "KEY_END",
                "187": "KEY_EQUAL",
                "27": "KEY_ESC",
                "36": "KEY_HOME",
                "45": "KEY_INSERT",
                "37": "KEY_LEFT",
                "189": "KEY_MINUS",
                "34": "KEY_PAGEDOWN",
                "33": "KEY_PAGEUP",
                // "190": "KEY_PERIOD",
                "13": "KEY_RETURN",
                "39": "KEY_RIGHT",
                "16": "KEY_SHIFT",
                // "32": "KEY_SPACE",
                "9": "KEY_TAB",
                "38": "KEY_UP",
                "91": "KEY_WINDOW"
                //"107" : "NUMPAD_ADD",
                //"194" : "NUMPAD_COMMA",
                //"110" : "NUMPAD_DECIMAL",
                //"111" : "NUMPAD_DIVIDE",
                //"12" : "NUMPAD_EQUAL",
                //"106" : "NUMPAD_MULTIPLY",
                //"109" : "NUMPAD_SUBTRACT"
            },
            onStateChanged = function (item, that) {
                if (item && item.onStateChanged) {
                    item.onStateChanged.call(that, that);
                }
                else if (this.onStateChanged) {
                    this.onStateChanged.call(that, that);
                }

                if (that.state == "changeValue") {
                    if (item && item.onChange) {
                        item.onChange.call(that, that);
                    }
                    else if (this.onChange) {
                        this.onChange.call(that, that);
                    }
                }

                item = null;
                that = null;
                return true;
            },
            getOptionGroupTmpl = function (columnKeys) {
                return `
                <div class="ax5-ui-combobox-option-group {{theme}} {{size}}" data-ax5-combobox-option-group="{{id}}">
                    <div class="ax-combobox-body">
                        <div class="ax-combobox-option-group-content" data-combobox-els="content"></div>
                    </div>
                    <div class="ax-combobox-arrow"></div> 
                </div>
                `;
            },
            getTmpl = function () {
                return `
                <div class="form-control {{formSize}} ax5-ui-combobox-display {{theme}}" 
                data-ax5-combobox-display="{{id}}" data-ax5-combobox-instance="{{instanceId}}">
                    <div class="ax5-ui-combobox-display-table" data-combobox-els="display-table">
                        <a {{^tabIndex}}href="#ax5combobox-{{id}}" {{/tabIndex}}{{#tabIndex}}tabindex="{{tabIndex}}" {{/tabIndex}} data-ax5-combobox-display="label" 
                        contenteditable="true" spellcheck="false">{{label}}</a>
                        <div data-ax5-combobox-display="addon"> 
                            {{#multiple}}{{#reset}}
                            <span class="addon-icon-reset" data-selected-clear="true">{{{.}}}</span>
                            {{/reset}}{{/multiple}}
                            {{#icons}}
                            <span class="addon-icon-closed">{{clesed}}</span>
                            <span class="addon-icon-opened">{{opened}}</span>
                            {{/icons}}
                            {{^icons}}
                            <span class="addon-icon-closed"><span class="addon-icon-arrow"></span></span>
                            <span class="addon-icon-opened"><span class="addon-icon-arrow"></span></span>
                            {{/icons}}
                        </div>
                    </div>
                </a>
                `;
            },
            getSelectTmpl = function () {
                return `
                <select tabindex="-1" class="form-control {{formSize}}" name="{{name}}" {{#multiple}}multiple="multiple"{{/multiple}}></select>
                `;
            },
            getOptionsTmpl = function (columnKeys) {
                return `
                {{#waitOptions}}
                    <div class="ax-combobox-option-item">
                            <div class="ax-combobox-option-item-holder">
                                <span class="ax-combobox-option-item-cell ax-combobox-option-item-label">
                                    {{{lang.loading}}}
                                </span>
                            </div>
                        </div>
                {{/waitOptions}}
                {{^waitOptions}}
                    {{#options}}
                        {{#optgroup}}
                            <div class="ax-combobox-option-group">
                                <div class="ax-combobox-option-item-holder">
                                    <span class="ax-combobox-option-group-label">
                                        {{{.}}}
                                    </span>
                                </div>
                                {{#options}}
                                <div class="ax-combobox-option-item" data-option-focus-index="{{@findex}}" data-option-group-index="{{@gindex}}" data-option-index="{{@index}}" 
                                data-option-value="{{${columnKeys.optionValue}}}" 
                                {{#${columnKeys.optionSelected}}}data-option-selected="true"{{/${columnKeys.optionSelected}}}>
                                    <div class="ax-combobox-option-item-holder">
                                        {{#multiple}}
                                        <span class="ax-combobox-option-item-cell ax-combobox-option-item-checkbox">
                                            <span class="item-checkbox-wrap useCheckBox" data-option-checkbox-index="{{@i}}"></span>
                                        </span>
                                        {{/multiple}}
                                        <span class="ax-combobox-option-item-cell ax-combobox-option-item-label">{{${columnKeys.optionText}}}</span>
                                    </div>
                                </div>
                                {{/options}}
                            </div>                            
                        {{/optgroup}}
                        {{^optgroup}}
                        <div class="ax-combobox-option-item" data-option-focus-index="{{@findex}}" data-option-index="{{@index}}" data-option-value="{{${columnKeys.optionValue}}}" {{#${columnKeys.optionSelected}}}data-option-selected="true"{{/${columnKeys.optionSelected}}}>
                            <div class="ax-combobox-option-item-holder">
                                {{#multiple}}
                                <span class="ax-combobox-option-item-cell ax-combobox-option-item-checkbox">
                                    <span class="item-checkbox-wrap useCheckBox" data-option-checkbox-index="{{@i}}"></span>
                                </span>
                                {{/multiple}}
                                <span class="ax-combobox-option-item-cell ax-combobox-option-item-label">{{${columnKeys.optionText}}}</span>
                            </div>
                        </div>
                        {{/optgroup}}
                    {{/options}}
                    {{^options}}
                        <div class="ax-combobox-option-item">
                            <div class="ax-combobox-option-item-holder">
                                <span class="ax-combobox-option-item-cell ax-combobox-option-item-label">
                                    {{{lang.noOptions}}}
                                </span>
                            </div>
                        </div>
                    {{/options}}
                {{/waitOptions}}
                `;
            },
            alignComboboxDisplay = function () {
                var i = this.queue.length, w;
                while (i--) {
                    if (this.queue[i].$display) {
                        w = Math.max(this.queue[i].$select.outerWidth(), U.number(this.queue[i].minWidth));
                        this.queue[i].$display.css({
                            "min-width": w
                        });
                        if (this.queue[i].reset) {
                            this.queue[i].$display.find(".addon-icon-reset").css({
                                "line-height": this.queue[i].$display.height() + "px"
                            });
                        }
                    }
                }

                i = null;
                w = null;
                return this;
            },
            alignComboboxOptionGroup = function (append) {
                if (!this.activecomboboxOptionGroup) return this;

                var
                    item = this.queue[this.activecomboboxQueueIndex],
                    pos = {},
                    dim = {};

                if (append) jQuery(document.body).append(this.activecomboboxOptionGroup);

                pos = item.$target.offset();
                dim = {
                    width: item.$target.outerWidth(),
                    height: item.$target.outerHeight()
                };

                // picker css(width, left, top) & direction 결정
                if (!item.direction || item.direction === "" || item.direction === "auto") {
                    // set direction
                    item.direction = "top";
                }

                if (append) {
                    this.activecomboboxOptionGroup
                        .addClass("direction-" + item.direction);
                }
                this.activecomboboxOptionGroup
                    .css((function () {
                        if (item.direction == "top") {
                            return {
                                left: pos.left,
                                top: pos.top + dim.height + 1,
                                width: dim.width
                            }
                        }
                        else if (item.direction == "bottom") {
                            return {
                                left: pos.left,
                                top: pos.top - this.activecomboboxOptionGroup.outerHeight() - 1,
                                width: dim.width
                            }
                        }
                    }).call(this));
            },
            onBodyClick = function (e, target) {
                if (!this.activecomboboxOptionGroup) return this;

                var
                    item = this.queue[this.activecomboboxQueueIndex],
                    clickEl = "display"
                    ;

                target = U.findParentNode(e.target, function (target) {
                    if (target.getAttribute("data-option-value")) {
                        clickEl = "optionItem";
                        return true;
                    }
                    else if (item.$target.get(0) == target) {
                        clickEl = "display";
                        return true;
                    }
                });

                if (!target) {
                    this.close();
                    return this;
                }
                else if (clickEl === "optionItem") {
                    this.val(item.id, {
                        index: {
                            gindex: target.getAttribute("data-option-group-index"),
                            index: target.getAttribute("data-option-index")
                        }
                    }, undefined, "internal");
                    item.$display.focus();
                    if (!item.multiple) this.close();
                }
                else {
                    //open and display click
                    //console.log(this.instanceId);
                }

                return this;
            },
            onBodyKeyup = function (e) {
                if (e.keyCode == ax5.info.eventKeys.ESC) {
                    this.close();
                }
                else if (e.which == ax5.info.eventKeys.RETURN) {
                    if (this.queue[this.activecomboboxQueueIndex].optionFocusIndex > -1) { // 아이템에 포커스가 활성화 된 후, 마우스 이벤트 이면 무시
                        var $option = this.activecomboboxOptionGroup.find('[data-option-focus-index="' + this.queue[this.activecomboboxQueueIndex].optionFocusIndex + '"]');
                        this.val(this.queue[this.activecomboboxQueueIndex].id, {
                            index: {
                                gindex: $option.attr("data-option-group-index"),
                                index: $option.attr("data-option-index")
                            }
                        }, undefined, "internal");

                        if (!this.queue[this.activecomboboxQueueIndex].multiple) this.close();
                    }
                }
            },
            getLabel = function (queIdx) {
                var item = this.queue[queIdx];
                var labels = [];

                if (U.isArray(item.selected) && item.selected.length > 0) {
                    item.selected.forEach(function (n) {
                        if (n.selected) labels.push(n[item.columnKeys.optionText]);
                    });
                }

                return labels.join(',');

            },
            syncLabel = function (queIdx) {
                this.queue[queIdx].$display
                    .find('[data-ax5-combobox-display="label"]')
                    .html(getLabel.call(this, queIdx));
            },
            focusWord = function (queIdx, searchWord) {
                var options = [], i = 0, l = this.queue[queIdx].indexedOptions.length - 1, n;
                while (l - i++) {
                    n = this.queue[queIdx].indexedOptions[i];

                    if (('' + n.value).toLowerCase() == searchWord.toLowerCase()) {
                        options = [{'@findex': n['@findex'], optionsSort: 0}];
                        break;
                    } else {
                        var sort = ('' + n.value).toLowerCase().search(searchWord.toLowerCase());
                        if (sort > -1) {
                            options.push({'@findex': n['@findex'], optionsSort: sort});
                            if (options.length > 2) break;
                        }
                        sort = null;
                    }
                }
                options.sort(function (a, b) {
                    return a.optionsSort - b.optionsSort;
                });
                if (options && options.length > 0) {
                    focusMove.call(this, queIdx, undefined, options[0]['@findex']);
                }

                try {
                    return options;
                } finally {
                    options = null;
                    i = null;
                    l = null;
                    n = null;
                }
            },
            focusMove = function (queIdx, direction, findex) {
                var _focusIndex,
                    _prevFocusIndex,
                    focusOptionEl,
                    optionGroupScrollContainer;
                if (this.activecomboboxOptionGroup && this.queue[queIdx].options && this.queue[queIdx].options.length > 0) {

                    if (typeof findex !== "undefined") {
                        _focusIndex = findex
                    }
                    else {
                        _prevFocusIndex = (this.queue[queIdx].optionFocusIndex == -1) ? this.queue[queIdx].optionSelectedIndex || -1 : this.queue[queIdx].optionFocusIndex;
                        if (_prevFocusIndex == -1) {
                            _focusIndex = (direction > 0) ? 0 : this.queue[queIdx].optionItemLength - 1;
                        }
                        else {
                            _focusIndex = _prevFocusIndex + direction;
                            if (_focusIndex < 0) _focusIndex = 0;
                            else if (_focusIndex > this.queue[queIdx].optionItemLength - 1) _focusIndex = this.queue[queIdx].optionItemLength - 1;
                        }
                    }

                    this.queue[queIdx].optionFocusIndex = _focusIndex;

                    this.activecomboboxOptionGroup
                        .find('[data-option-focus-index]')
                        .removeClass("hover");

                    focusOptionEl = this.activecomboboxOptionGroup
                        .find('[data-option-focus-index="' + _focusIndex + '"]')
                        .addClass("hover");

                    optionGroupScrollContainer = this.activecomboboxOptionGroup.find('[data-combobox-els="content"]');

                    let focusOptionElHeight = focusOptionEl.outerHeight(),
                        optionGroupScrollContainerHeight = optionGroupScrollContainer.innerHeight(),
                        optionGroupScrollContainerScrollTop = optionGroupScrollContainer.scrollTop(),
                        focusOptionElTop = focusOptionEl.position().top + optionGroupScrollContainer.scrollTop();

                    if (optionGroupScrollContainerHeight + optionGroupScrollContainerScrollTop < focusOptionElTop + focusOptionElHeight) {
                        optionGroupScrollContainer.scrollTop(focusOptionElTop + focusOptionElHeight - optionGroupScrollContainerHeight);
                    }
                    else if (optionGroupScrollContainerScrollTop > focusOptionElTop) {
                        optionGroupScrollContainer.scrollTop(focusOptionElTop);
                    }
                    // optionGroup scroll check
                }
            },
            setComboValue = function (queIdx, value) {
                if(this.queue[this.activecomboboxQueueIndex].optionFocusIndex > -1){// 포커스된 옵션이 있는 경우

                }
                else{
                    // 포커스된 옵션이 없는경우,  사용자 입력값으로 새옵션을 만들고 종료
                    if (!this.queue[this.activecomboboxQueueIndex].multiple) this.close();
                }
            },
            bindComboboxTarget = (function () {
                var comboboxEvent = {
                    'click': function (queIdx, e) {
                        var target = U.findParentNode(e.target, function (target) {
                            if (target.getAttribute("data-selected-clear")) {
                                //clickEl = "clear";
                                return true;
                            }
                        });

                        if (target) {
                            // selected clear
                            this.val(queIdx, {clear: true});
                        }
                        else {
                            if (self.activecomboboxQueueIndex == queIdx) {
                                if (this.queue[queIdx].optionFocusIndex == -1) { // 아이템에 포커스가 활성화 된 후, 마우스 이벤트 이면 무시
                                    self.close();
                                }
                            }
                            else {
                                self.open(queIdx);
                            }
                        }
                        //U.stopEvent(e);
                    },
                    'keyUp': function (queIdx, e) {

                        // console.log(this.queue[queIdx].$displayLabel.text());
                        /*
                         if (e.which == ax5.info.eventKeys.SPACE) {
                         comboboxEvent.click.call(this, queIdx, e);
                         }
                         else
                         */

                        if (!ctrlKeys[e.which]) {
                            // 사용자 입력이 뜸해지면 찾고 ...
                            if (this.keyUpTimer) clearTimeout(this.keyUpTimer);
                            this.keyUpTimer = setTimeout((function () {
                                var searchWord = this.queue[queIdx].$displayLabel.text();
                                // console.log(searchWord);
                                focusWord.call(this, queIdx, searchWord);
                            }).bind(this), 500);
                        }
                    },
                    'keyDown': function (queIdx, e) {
                        if (e.which == ax5.info.eventKeys.RETURN) {
                            var inputValue = this.queue[queIdx].$displayLabel.text();
                            if (this.keyUpTimer) clearTimeout(this.keyUpTimer); // 리턴키를 처리하고 포커스워드는 제거
                            console.log(inputValue);
                            setComboValue.call(this, queIdx, inputValue);
                            U.stopEvent(e);
                        }
                        if (e.which == ax5.info.eventKeys.DOWN) {
                            focusMove.call(this, queIdx, 1);
                            U.stopEvent(e);
                        }
                        else if (e.which == ax5.info.eventKeys.UP) {
                            focusMove.call(this, queIdx, -1);
                            U.stopEvent(e);
                        }
                    },
                    'focus': function (queIdx, e) {
                        //console.log(e);
                    },
                    'blur': function (queIdx, e) {
                        //console.log(e);
                    }
                };
                return function (queIdx) {
                    var item = this.queue[queIdx];
                    var data = {};
                    item.selected = [];

                    if (!item.$display) {
                        /// 템플릿에 전달할 오브젝트 선언
                        data.instanceId = this.instanceId;
                        data.id = item.id;
                        data.name = item.name;
                        data.theme = item.theme;
                        data.tabIndex = item.tabIndex;
                        data.multiple = item.multiple;
                        data.reset = item.reset;

                        data.label = getLabel.call(this, queIdx);
                        data.formSize = (function () {
                            return (item.size) ? "input-" + item.size : "";
                        })();

                        item.$display = jQuery(ax5.mustache.render(getTmpl.call(this, queIdx), data));
                        item.$displayLabel = item.$display.find('[data-ax5-combobox-display="label"]');

                        if (item.$target.find("select").get(0)) {
                            item.$select = item.$target.find("select");
                            // input 속성만 변경
                            item.$select
                                .attr("tabindex", "-1")
                                .attr("class", "form-control " + data.formSize);
                            if (data.name) {
                                item.$select.attr("name", "name");
                            }
                            if (data.multiple) {
                                item.$select.attr("multiple", "multiple");
                            }
                        }
                        else {
                            item.$select = jQuery(ax5.mustache.render(getSelectTmpl.call(this, queIdx), data));
                            item.$target.append(item.$select);
                            // combobox append
                        }

                        item.$target.append(item.$display);
                        // 라벨에 사용자 입력 필드가 있으므로 displayInput은 필요 없음.
                        item.options = syncComboboxOptions.call(this, queIdx, item.options);

                        alignComboboxDisplay.call(this);
                    }
                    else {
                        item.$displayLabel
                            .html(getLabel.call(this, queIdx));
                        item.options = syncComboboxOptions.call(this, queIdx, item.options);

                        alignComboboxDisplay.call(this);
                    }

                    item.$display
                        .unbind('click.ax5combobox')
                        .bind('click.ax5combobox', comboboxEvent.click.bind(this, queIdx));

                    // combobox 태그에 대한 이벤트 감시
                    item.$displayLabel
                        .unbind("focus.ax5combobox")
                        .bind("focus.ax5combobox", comboboxEvent.focus.bind(this, queIdx))
                        .unbind("blur.ax5combobox")
                        .bind("blur.ax5combobox", comboboxEvent.blur.bind(this, queIdx))
                        .unbind('keyup.ax5combobox')
                        .bind('keyup.ax5combobox', comboboxEvent.keyUp.bind(this, queIdx))
                        .unbind("keydown.ax5combobox")
                        .bind("keydown.ax5combobox", comboboxEvent.keyDown.bind(this, queIdx));

                    data = null;
                    item = null;
                    queIdx = null;
                    return this;
                };
            })(),
            syncComboboxOptions = (function () {
                var setSelected = function (queIdx, O) {
                    if (!O) {
                        this.queue[queIdx].selected = [];
                    }
                    else {
                        if (this.queue[queIdx].multiple) this.queue[queIdx].selected.push(jQuery.extend({}, O));
                        else this.queue[queIdx].selected[0] = jQuery.extend({}, O);
                    }
                };

                return function (queIdx, options) {
                    var item = this.queue[queIdx];
                    var po, elementOptions, newOptions, focusIndex = 0;
                    setSelected.call(this, queIdx, false); // item.selected 초기화

                    if (options) {
                        item.options = options;
                        item.indexedOptions = [];

                        // combobox options 태그 생성
                        po = [];
                        item.options.forEach(function (O, OIndex) {
                            if (O.optgroup) {
                                // todo
                                O['@gindex'] = OIndex;
                                O.options.forEach(function (OO, OOIndex) {
                                    OO['@index'] = OOIndex;
                                    OO['@findex'] = focusIndex;
                                    po.push('<option value="' + OO[item.columnKeys.optionValue] + '" '
                                        + (OO[item.columnKeys.optionSelected] ? ' selected="selected"' : '') + '>'
                                        + OO[item.columnKeys.optionText] + '</option>');
                                    if (OO[item.columnKeys.optionSelected]) {
                                        setSelected.call(self, queIdx, OO);
                                    }

                                    item.indexedOptions.push({
                                        '@findex': focusIndex, value: OO[item.columnKeys.optionValue], text: OO[item.columnKeys.optionText]
                                    });
                                    focusIndex++;
                                });
                            }
                            else {
                                O['@index'] = OIndex;
                                O['@findex'] = focusIndex;
                                po.push('<option value="' + O[item.columnKeys.optionValue] + '" '
                                    + (O[item.columnKeys.optionSelected] ? ' selected="selected"' : '') + '>'
                                    + O[item.columnKeys.optionText] + '</option>');
                                if (O[item.columnKeys.optionSelected]) {
                                    setSelected.call(self, queIdx, O);
                                }

                                item.indexedOptions.push({
                                    '@findex': focusIndex, value: O[item.columnKeys.optionValue], text: O[item.columnKeys.optionText]
                                });
                                focusIndex++;
                            }
                        });
                        item.optionItemLength = focusIndex;
                        item.$select.html(po.join(''));
                    }
                    else {
                        /// 현재 사용되지 않는 구문
                        /// select > options 태그로 스크립트 options를 만들어주는 역할
                        elementOptions = U.toArray(item.$select.get(0).options);
                        // select option 스크립트 생성
                        newOptions = [];
                        elementOptions.forEach(function (O, OIndex) {
                            var option = {};
                            option[item.columnKeys.optionValue] = O.value;
                            option[item.columnKeys.optionText] = O.text;
                            option[item.columnKeys.optionSelected] = O.selected;
                            option['@index'] = OIndex;
                            if (O.selected) setSelected.call(self, queIdx, option);
                            newOptions.push(option);
                            option = null;
                        });
                        item.options = newOptions;
                        item.indexedOptions = newOptions;
                    }

                    /*
                     if (!item.multiple && item.selected.length == 0 && item.options && item.options[0]) {
                     if (item.options[0].optgroup) {
                     item.options[0].options[0][item.columnKeys.optionSelected] = true;
                     item.selected.push(jQuery.extend({}, item.options[0].options[0]));
                     }
                     else {
                     item.options[0][item.columnKeys.optionSelected] = true;
                     item.selected.push(jQuery.extend({}, item.options[0]));
                     }
                     }
                     */

                    po = null;
                    elementOptions = null;
                    newOptions = null;
                    return item.options;
                }
            })(),
            getQueIdx = function (boundID) {
                if (!U.isString(boundID)) {
                    boundID = jQuery(boundID).data("data-ax5combobox-id");
                }
                if (!U.isString(boundID)) {
                    console.log(ax5.info.getError("ax5combobox", "402", "getQueIdx"));
                    return;
                }
                return U.search(this.queue, function () {
                    return this.id == boundID;
                });
            };
        /// private end

        /**
         * Preferences of combobox UI
         * @method ax5.ui.combobox.setConfig
         * @param {Object} config - 클래스 속성값
         * @returns {ax5.ui.combobox}
         * @example
         * ```
         * ```
         */
        this.init = function () {
            this.onStateChanged = cfg.onStateChanged;
            this.onChange = cfg.onChange;
            jQuery(window).bind("resize.ax5combobox-display-" + this.instanceId, (function () {
                alignComboboxDisplay.call(this);
            }).bind(this));
        };

        /**
         * bind combobox
         * @method ax5.ui.combobox.bind
         * @param {Object} item
         * @param {String} [item.id]
         * @param {String} [item.theme]
         * @param {Boolean} [item.multiple]
         * @param {Element} item.target
         * @param {Object[]} item.options
         * @returns {ax5.ui.combobox}
         */
        this.bind = function (item) {
            var
                comboboxConfig = {},
                queIdx;

            item = jQuery.extend(true, comboboxConfig, cfg, item);
            if (!item.target) {
                console.log(ax5.info.getError("ax5combobox", "401", "bind"));
                return this;
            }

            item.$target = jQuery(item.target);

            if (!item.id) item.id = item.$target.data("data-ax5combobox-id");
            if (!item.id) {
                item.id = 'ax5-combobox-' + ax5.getGuid();
                item.$target.data("data-ax5combobox-id", item.id);
            }
            item.name = item.$target.attr("data-ax5combobox");
            if (item.options) {
                item.options = JSON.parse(JSON.stringify(item.options));
            }

            // target attribute data
            (function (data) {
                if (U.isObject(data) && !data.error) {
                    item = jQuery.extend(true, item, data);
                }
            })(U.parseJson(item.$target.attr("data-ax5combobox-config"), true));

            queIdx = U.search(this.queue, function () {
                return this.id == item.id;
            });

            if (queIdx === -1) {
                this.queue.push(item);
                bindComboboxTarget.call(this, this.queue.length - 1);
            }
            else {
                this.queue[queIdx] = jQuery.extend(true, {}, this.queue[queIdx], item);
                bindComboboxTarget.call(this, queIdx);
            }

            comboboxConfig = null;
            queIdx = null;
            return this;
        };

        /**
         * open the optionBox of combobox
         * @method ax5.ui.combobox.open
         * @param {(String|Number|Element)} boundID
         * @param {Number} [tryCount]
         * @returns {ax5.ui.combobox}
         */
        this.open = (function () {

            var onExpand = function (item) {
                item.onExpand.call({
                    self: this,
                    item: item
                }, (function (O) {
                    if (this.waitOptionsCallback) {
                        var data = {};
                        var item = this.queue[this.activecomboboxQueueIndex];

                        /// 현재 selected 검증후 처리
                        (function (item, O) {
                            var optionsMap = {};
                            O.options.forEach(function (_O, _OIndex) {
                                _O["@index"] = _OIndex;
                                optionsMap[_O[item.columnKeys.optionValue]] = _O;
                            });
                            if (U.isArray(item.selected)) {
                                item.selected.forEach(function (_O) {
                                    if (optionsMap[_O[item.columnKeys.optionValue]]) {
                                        O.options[optionsMap[_O[item.columnKeys.optionValue]]["@index"]][item.columnKeys.optionSelected] = true;
                                    }
                                });
                            }
                        })(item, O);


                        item.$display
                            .find('[data-ax5-combobox-display="label"]')
                            .html(getLabel.call(this, this.activecomboboxQueueIndex));
                        item.options = synCcomboboxOptions.call(this, this.activecomboboxQueueIndex, O.options);

                        alignComboboxDisplay.call(this);

                        /// 템플릿에 전달할 오브젝트 선언
                        data.id = item.id;
                        data.theme = item.theme;
                        data.size = "ax5-ui-combobox-option-group-" + item.size;
                        data.multiple = item.multiple;
                        data.lang = item.lang;
                        data.options = item.options;
                        this.activecomboboxOptionGroup.find('[data-combobox-els="content"]').html(jQuery(ax5.mustache.render(getOptionsTmpl.call(this, item.columnKeys), data)));
                    }
                }).bind(this));
            };

            return function (boundID, tryCount) {
                this.waitOptionsCallback = null;

                /**
                 * open combobox from the outside
                 */
                var queIdx = (U.isNumber(boundID)) ? boundID : getQueIdx.call(this, boundID);
                var item = this.queue[queIdx];
                var data = {}, focusTop, selectedOptionEl;

                if (item.$display.attr("disabled")) return this;

                if (this.openTimer) clearTimeout(this.openTimer);
                if (this.activecomboboxOptionGroup) {
                    if (this.activecomboboxQueueIndex == queIdx) {
                        return this;
                    }

                    if (tryCount > 2) return this;
                    this.close();
                    this.openTimer = setTimeout((function () {
                        this.open(queIdx, (tryCount || 0) + 1);
                    }).bind(this), cfg.animateTime);

                    return this;
                }

                item.optionFocusIndex = -1; // optionGroup이 열리면 포커스 인덱스 초기화 -1로
                if (item.selected && item.selected.length > 0) {
                    item.optionSelectedIndex = item.selected[0]["@findex"];
                }

                /// 템플릿에 전달할 오브젝트 선언
                data.id = item.id;
                data.theme = item.theme;
                data.size = "ax5-ui-combobox-option-group-" + item.size;
                data.multiple = item.multiple;

                data.lang = item.lang;
                item.$display.attr("data-combobox-option-group-opened", "true");

                if (item.onExpand) {
                    // onExpand 인 경우 UI 대기모드 추가
                    data.waitOptions = true;
                }

                data.options = item.options;

                this.activecomboboxOptionGroup = jQuery(ax5.mustache.render(getOptionGroupTmpl.call(this, item.columnKeys), data));
                this.activecomboboxOptionGroup.find('[data-combobox-els="content"]').html(jQuery(ax5.mustache.render(getOptionsTmpl.call(this, item.columnKeys), data)));
                this.activecomboboxQueueIndex = queIdx;

                alignComboboxOptionGroup.call(this, "append"); // alignComboboxOptionGroup 에서 body append
                jQuery(window).bind("resize.ax5combobox-" + this.instanceId, (function () {
                    alignComboboxOptionGroup.call(this);
                }).bind(this));

                if (item.selected && item.selected.length > 0) {
                    selectedOptionEl = this.activecomboboxOptionGroup.find('[data-option-index="' + item.selected[0]["@index"] + '"]');
                    if (selectedOptionEl.get(0)) {
                        focusTop = selectedOptionEl.position().top - this.activecomboboxOptionGroup.height() / 3;
                        this.activecomboboxOptionGroup.find('[data-combobox-els="content"]')
                            .stop().animate({scrollTop: focusTop}, item.animateTime, 'swing', function () {
                        });
                    }
                }

                //item.$displayLabel.val('');
                setTimeout(function () {
                    item.$displayLabel.trigger("focus");
                    U.selectRange(item.$displayLabel, "end"); // 포커스 end || selectAll
                }, 1);


                jQuery(window).bind("keyup.ax5combobox-" + this.instanceId, (function (e) {
                    e = e || window.event;
                    onBodyKeyup.call(this, e);
                    U.stopEvent(e);
                }).bind(this));

                jQuery(window).bind("click.ax5combobox-" + this.instanceId, (function (e) {
                    e = e || window.event;
                    onBodyClick.call(this, e);
                    U.stopEvent(e);
                }).bind(this));

                onStateChanged.call(this, item, {
                    self: this,
                    state: "open",
                    item: item
                });

                // waitOption timer
                if (item.onExpand) {
                    this.waitOptionsCallback = true;
                    onExpand.call(this, item);
                }

                data = null;
                focusTop = null;
                selectedOptionEl = null;
                return this;
            }
        })();

        /**
         * @method ax5.ui.combobox.update
         * @param {(Object|String)} item
         * @returns {ax5.ui.combobox}
         */
        this.update = function (_item) {
            this.bind(_item);
            return this;
        };

        /**
         * @method ax5.ui.combobox.val
         * @param {(String|Number|Element)} boundID
         * @param {(String|Object|Array)} [value]
         * @param {Boolean} [Selected]
         * @returns {ax5.ui.combobox}
         */
        this.val = (function () {

            // todo : val 함수 리팩토링 필요
            var getSelected = function (_item, o, selected) {
                if (typeof selected === "undefined") {
                    return (_item.multiple) ? !o : true;
                } else {
                    return selected;
                }
            };
            var clearSelected = function (queIdx) {
                this.queue[queIdx].options.forEach(function (n) {
                    if (n.optgroup) {
                        n.options.forEach(function (nn) {
                            nn.selected = false;
                        });
                    }
                    else {
                        n.selected = false;
                    }
                });
            };

            var processor = {
                'index': function (queIdx, value, selected) {
                    // 클래스 내부에서 호출된 형태, 그런 이유로 옵션그룹에 대한 상태를 변경 하고 있다.
                    var item = this.queue[queIdx];

                    /*
                     if (U.isArray(value.index)) {
                     value.index.forEach(function (n) {
                     item.options[n][item.columnKeys.optionSelected] = getSelected(item, item.options[n][item.columnKeys.optionSelected], selected);
                     self.activecomboboxOptionGroup
                     .find('[data-option-index="' + n + '"]')
                     .attr("data-option-Selected", item.options[n][item.columnKeys.optionSelected].toString());
                     });
                     }
                     else {
                     }
                     */
                    if (U.isString(value.index.gindex)) {
                        item.options[value.index.gindex].options[value.index.index][item.columnKeys.optionSelected] = getSelected(item, item.options[value.index.gindex].options[value.index.index][item.columnKeys.optionSelected], selected);
                        self.activecomboboxOptionGroup
                            .find('[data-option-group-index="' + value.index.gindex + '"][data-option-index="' + value.index.index + '"]')
                            .attr("data-option-Selected", item.options[value.index.gindex].options[value.index.index][item.columnKeys.optionSelected].toString());
                    }
                    else {
                        item.options[value.index.index][item.columnKeys.optionSelected] = getSelected(item, item.options[value.index.index][item.columnKeys.optionSelected], selected);
                        self.activecomboboxOptionGroup
                            .find('[data-option-index="' + value.index.index + '"]')
                            .attr("data-option-Selected", item.options[value.index.index][item.columnKeys.optionSelected].toString());

                    }

                    syncComboboxOptions.call(this, queIdx, item.options);
                    syncLabel.call(this, queIdx);
                    alignComboboxOptionGroup.call(this);
                },
                'arr': function (queIdx, values, selected) {
                    values.forEach(function (value) {
                        if (U.isString(value) || U.isNumber(value)) {
                            processor.value.call(self, queIdx, value, selected);
                        }
                        else {
                            for (var key in processor) {
                                if (value[key]) {
                                    processor[key].call(self, queIdx, value, selected);
                                    break;
                                }
                            }
                        }
                    });
                },
                'value': function (queIdx, value, selected) {
                    var item = this.queue[queIdx];
                    var optionIndex = U.search(item.options, function () {
                        return this[item.columnKeys.optionValue] == value;
                    });
                    if (optionIndex > -1) {
                        item.options[optionIndex][item.columnKeys.optionSelected] = getSelected(item, item.options[optionIndex][item.columnKeys.optionSelected], selected);
                    }
                    else {
                        console.log(ax5.info.getError("ax5combobox", "501", "val"));
                        return;
                    }

                    synCcomboboxOptions.call(this, queIdx, item.options);
                    syncLabel.call(this, queIdx);
                },
                'text': function (queIdx, value, selected) {
                    var item = this.queue[queIdx];
                    var optionIndex = U.search(item.options, function () {
                        return this[item.columnKeys.optionText] == value;
                    });
                    if (optionIndex > -1) {
                        item.options[optionIndex][item.columnKeys.optionSelected] = getSelected(item, item.options[optionIndex][item.columnKeys.optionSelected], selected);
                    }
                    else {
                        console.log(ax5.info.getError("ax5combobox", "501", "val"));
                        return;
                    }

                    synCcomboboxOptions.call(this, queIdx, item.options);
                    syncLabel.call(this, queIdx);
                },
                'clear': function (queIdx) {
                    clearSelected.call(this, queIdx);
                    synCcomboboxOptions.call(this, queIdx, this.queue[queIdx].options);
                    syncLabel.call(this, queIdx);

                    if (this.activecomboboxOptionGroup) {
                        this.activecomboboxOptionGroup
                            .find('[data-option-index]')
                            .attr("data-option-Selected", "false");
                    }
                }
            };

            return function (boundID, value, selected, internal) {
                var queIdx = (U.isNumber(boundID)) ? boundID : getQueIdx.call(this, boundID);
                if (queIdx === -1) {
                    console.log(ax5.info.getError("ax5combobox", "402", "val"));
                    return;
                }

                // setValue 이면 현재 선택값 초기화
                if (typeof value !== "undefined" && !this.queue[queIdx].multiple) {
                    clearSelected.call(this, queIdx);
                }

                if (typeof value == "undefined") {
                    return this.queue[queIdx].selected;
                }
                else if (U.isArray(value)) {
                    processor.arr.call(this, queIdx, value, selected);
                }
                else if (U.isString(value) || U.isNumber(value)) {
                    processor.value.call(this, queIdx, value, selected);
                }
                else {
                    if (value === null) {
                        processor.clear.call(this, queIdx);
                    }
                    else {
                        for (var key in processor) {
                            if (value[key]) {
                                processor[key].call(this, queIdx, value, selected);
                                break;
                            }
                        }
                    }
                }

                if (typeof value !== "undefined") {
                    onStateChanged.call(this, this.queue[queIdx], {
                        self: this,
                        item: this.queue[queIdx],
                        state: (internal) ? "changeValue" : "setValue",
                        value: this.queue[queIdx].selected,
                        internal: internal
                    });
                }

                boundID = null;
                return this;
            };
        })();

        /**
         * @method ax5.ui.combobox.close
         * @returns {ax5.ui.combobox}
         */
        this.close = function (item) {
            if (this.closeTimer) clearTimeout(this.closeTimer);
            if (!this.activecomboboxOptionGroup) return this;

            item = this.queue[this.activecomboboxQueueIndex];
            item.optionFocusIndex = -1;
            item.$display.removeAttr("data-combobox-option-group-opened").trigger("focus");

            this.activecomboboxOptionGroup.addClass("destroy");

            jQuery(window)
                .unbind("resize.ax5combobox-" + this.instanceId)
                .unbind("click.ax5combobox-" + this.instanceId)
                .unbind("keyup.ax5combobox-" + this.instanceId);

            this.closeTimer = setTimeout((function () {
                if (this.activecomboboxOptionGroup) this.activecomboboxOptionGroup.remove();
                this.activecomboboxOptionGroup = null;
                this.activecomboboxQueueIndex = -1;

                onStateChanged.call(this, item, {
                    self: this,
                    state: "close"
                });

            }).bind(this), cfg.animateTime);
            this.waitOptionsCallback = null;
            return this;
        };

        this.enable = function (boundID) {
            var queIdx = getQueIdx.call(this, boundID);
            this.queue[queIdx].$display.removeAttr("disabled");
            this.queue[queIdx].$input.removeAttr("disabled");

            onStateChanged.call(this, this.queue[queIdx], {
                self: this,
                state: "enable"
            });

            return this;
        };

        this.disable = function (boundID) {
            var queIdx = getQueIdx.call(this, boundID);
            this.queue[queIdx].$display.attr("disabled", "disabled");
            this.queue[queIdx].$input.attr("disabled", "disabled");

            onStateChanged.call(this, this.queue[queIdx], {
                self: this,
                state: "disable"
            });

            return this;
        };

        // 클래스 생성자
        this.main = (function () {
            if (arguments && U.isObject(arguments[0])) {
                this.setConfig(arguments[0]);
            }
            else {
                this.init();
            }
        }).apply(this, arguments);
    };
    //== UI Class

    root.combobox = (function () {
        if (U.isFunction(_SUPER_)) axClass.prototype = new _SUPER_(); // 상속
        return axClass;
    })(); // ax5.ui에 연결

})(ax5.ui, ax5.ui.root);

ax5.ui.combobox_instance = new ax5.ui.combobox();
jQuery.fn.ax5combobox = (function () {
    return function (config) {
        if (ax5.util.isString(arguments[0])) {
            var methodName = arguments[0];

            switch (methodName) {
                case "open":
                    return ax5.ui.combobox_instance.open(this);
                    break;
                case "close":
                    return ax5.ui.combobox_instance.close(this);
                    break;
                case "setValue":
                    return ax5.ui.combobox_instance.val(this, arguments[1], arguments[2]);
                    break;
                case "getValue":
                    return ax5.ui.combobox_instance.val(this);
                    break;
                case "enable":
                    return ax5.ui.combobox_instance.enable(this);
                    break;
                case "disable":
                    return ax5.ui.combobox_instance.disable(this);
                    break;
                default:
                    return this;
            }
        }
        else {
            if (typeof config == "undefined") config = {};
            jQuery.each(this, function () {
                var defaultConfig = {
                    target: this
                };
                config = jQuery.extend({}, config, defaultConfig);
                ax5.ui.combobox_instance.bind(config);
            });
        }
        return this;
    }
})();