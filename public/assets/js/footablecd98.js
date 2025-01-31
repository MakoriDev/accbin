 /*! * FooTable - Awesome Responsive Tables * Version : 2.0.1.4 * http://fooplugins.com/plugins/footable-jquery/ * * Requires jQuery - http://jquery.com/ * * Copyright 2014 Steven Usher & Brad Vincent * Released under the MIT license * You are free to use FooTable in commercial projects as long as this copyright header is left intact. * * Date: 16 Feb 2014 */
 (function($, w, undefined) {
     w.footable = {
         options: {
             delay: 100,
             breakpoints: {
                 phone: 480,
                 tablet: 1024
             },
             parsers: {
                 alpha: function(cell) {
                     return $(cell).data('value') || $.trim($(cell).text());
                 },
                 numeric: function(cell) {
                     var val = $(cell).data('value') || $(cell).text().replace(/[^0-9.-]/g, '');
                     val = parseFloat(val);
                     if (isNaN(val)) val = 0;
                     return val;
                 }
             },
             addRowToggle: true,
             calculateWidthOverride: null,
             toggleSelector: ' > tbody > tr:not(.footable-row-detail)',
             columnDataSelector: '> thead > tr:last-child > th, > thead > tr:last-child > td',
             detailSeparator: ':',
             toggleHTMLElement: '<span />',
             createGroupedDetail: function(data) {
                 var groups = {
                     '_none': {
                         'name': null,
                         'data': []
                     }
                 };
                 for (var i = 0; i < data.length; i++) {
                     var groupid = data[i].group;
                     if (groupid !== null) {
                         if (!(groupid in groups)) groups[groupid] = {
                             'name': data[i].groupName || data[i].group,
                             'data': []
                         };
                         groups[groupid].data.push(data[i]);
                     } else {
                         groups._none.data.push(data[i]);
                     }
                 }
                 return groups;
             },
             createDetail: function(element, data, createGroupedDetail, separatorChar, classes) {
                 var groups = createGroupedDetail(data);
                 for (var group in groups) {
                     if (groups[group].data.length === 0) continue;
                     if (group !== '_none') element.append('<div class="' + classes.detailInnerGroup + '">' + groups[group].name + '</div>');
                     for (var j = 0; j < groups[group].data.length; j++) {
                         var separator = (groups[group].data[j].name) ? separatorChar : '';
                         element.append('<div class="' + classes.detailInnerRow + '"><div class="' + classes.detailInnerName + '">' + groups[group].data[j].name + separator + '</div><div class="' + classes.detailInnerValue + '">' + groups[group].data[j].display + '</div></div>');
                     }
                 }
             },
             classes: {
                 main: 'footable',
                 loading: 'footable-loading',
                 loaded: 'footable-loaded',
                 toggle: 'footable-toggle',
                 disabled: 'footable-disabled',
                 detail: 'footable-row-detail',
                 detailCell: 'footable-row-detail-cell',
                 detailInner: 'footable-row-detail-inner',
                 detailInnerRow: 'footable-row-detail-row',
                 detailInnerGroup: 'footable-row-detail-group',
                 detailInnerName: 'footable-row-detail-name',
                 detailInnerValue: 'footable-row-detail-value',
                 detailShow: 'footable-detail-show'
             },
             triggers: {
                 initialize: 'footable_initialize',
                 resize: 'footable_resize',
                 redraw: 'footable_redraw',
                 toggleRow: 'footable_toggle_row',
                 expandFirstRow: 'footable_expand_first_row',
                 expandAll: 'footable_expand_all',
                 collapseAll: 'footable_collapse_all'
             },
             events: {
                 alreadyInitialized: 'footable_already_initialized',
                 initializing: 'footable_initializing',
                 initialized: 'footable_initialized',
                 resizing: 'footable_resizing',
                 resized: 'footable_resized',
                 redrawn: 'footable_redrawn',
                 breakpoint: 'footable_breakpoint',
                 columnData: 'footable_column_data',
                 rowDetailUpdating: 'footable_row_detail_updating',
                 rowDetailUpdated: 'footable_row_detail_updated',
                 rowCollapsed: 'footable_row_collapsed',
                 rowExpanded: 'footable_row_expanded',
                 rowRemoved: 'footable_row_removed',
                 reset: 'footable_reset'
             },
             debug: false,
             log: null
         },
         version: {
             major: 0,
             minor: 5,
             toString: function() {
                 return w.footable.version.major + '.' + w.footable.version.minor;
             },
             parse: function(str) {
                 version = /(d+).?(d+)?.?(d+)?/.exec(str);
                 return {
                     major: parseInt(version[1], 10) || 0,
                     minor: parseInt(version[2], 10) || 0,
                     patch: parseInt(version[3], 10) || 0
                 };
             }
         },
         plugins: {
             _validate: function(plugin) {
                 if (!$.isFunction(plugin)) {
                     if (w.footable.options.debug === true) console.error('Validation failed, expected type "function", received type "{0}".', typeof plugin);
                     return false;
                 }
                 var p = new plugin();
                 if (typeof p['name'] !== 'string') {
                     if (w.footable.options.debug === true) console.error('Validation failed, plugin does not implement a string property called "name".', p);
                     return false;
                 }
                 if (!$.isFunction(p['init'])) {
                     if (w.footable.options.debug === true) console.error('Validation failed, plugin "' + p['name'] + '" does not implement a function called "init".', p);
                     return false;
                 }
                 if (w.footable.options.debug === true) console.log('Validation succeeded for plugin "' + p['name'] + '".', p);
                 return true;
             },
             registered: [],
             register: function(plugin, options) {
                 if (w.footable.plugins._validate(plugin)) {
                     w.footable.plugins.registered.push(plugin);
                     if (typeof options === 'object') $.extend(true, w.footable.options, options);
                 }
             },
             load: function(instance) {
                 var loaded = [],
                     registered, i;
                 for (i = 0; i < w.footable.plugins.registered.length; i++) {
                     try {
                         registered = w.footable.plugins.registered[i];
                         loaded.push(new registered(instance));
                     } catch (err) {
                         if (w.footable.options.debug === true) console.error(err);
                     }
                 }
                 return loaded;
             },
             init: function(instance) {
                 for (var i = 0; i < instance.plugins.length; i++) {
                     try {
                         instance.plugins[i]['init'](instance);
                     } catch (err) {
                         if (w.footable.options.debug === true) console.error(err);
                     }
                 }
             }
         }
     };
     var instanceCount = 0;
     $.fn.footable = function(options) {
         options = options || {};
         var o = $.extend(true, {}, w.footable.options, options);
         return this.each(function() {
             instanceCount++;
             var footable = new Footable(this, o, instanceCount);
             $(this).data('footable', footable);
         });
     };

     function Timer() {
         var t = this;
         t.id = null;
         t.busy = false;
         t.start = function(code, milliseconds) {
             if (t.busy) {
                 return;
             }
             t.stop();
             t.id = setTimeout(function() {
                 code();
                 t.id = null;
                 t.busy = false;
             }, milliseconds);
             t.busy = true;
         };
         t.stop = function() {
             if (t.id !== null) {
                 clearTimeout(t.id);
                 t.id = null;
                 t.busy = false;
             }
         };
     }

     function Footable(t, o, id) {
         var ft = this;
         ft.id = id;
         ft.table = t;
         ft.options = o;
         ft.breakpoints = [];
         ft.breakpointNames = '';
         ft.columns = {};
         ft.plugins = w.footable.plugins.load(ft);
         var opt = ft.options,
             cls = opt.classes,
             evt = opt.events,
             trg = opt.triggers,
             indexOffset = 0;
         ft.timers = {
             resize: new Timer(),
             register: function(name) {
                 ft.timers[name] = new Timer();
                 return ft.timers[name];
             }
         };
         ft.init = function() {
             var $window = $(w),
                 $table = $(ft.table);
             w.footable.plugins.init(ft);
             if ($table.hasClass(cls.loaded)) {
                 ft.raise(evt.alreadyInitialized);
                 return;
             }
             ft.raise(evt.initializing);
             $table.addClass(cls.loading);
             $table.find(opt.columnDataSelector).each(function() {
                 var data = ft.getColumnData(this);
                 ft.columns[data.index] = data;
             });
             for (var name in opt.breakpoints) {
                 ft.breakpoints.push({
                     'name': name,
                     'width': opt.breakpoints[name]
                 });
                 ft.breakpointNames += (name + ' ');
             }
             ft.breakpoints.sort(function(a, b) {
                 return a['width'] - b['width'];
             });
             $table.unbind(trg.initialize).bind(trg.initialize, function() {
                 $table.removeData('footable_info');
                 $table.data('breakpoint', '');
                 $table.trigger(trg.resize);
                 $table.removeClass(cls.loading);
                 $table.addClass(cls.loaded).addClass(cls.main);
                 ft.raise(evt.initialized);
             }).unbind(trg.redraw).bind(trg.redraw, function() {
                 ft.redraw();
             }).unbind(trg.resize).bind(trg.resize, function() {
                 ft.resize();
             }).unbind(trg.expandFirstRow).bind(trg.expandFirstRow, function() {
                 $table.find(opt.toggleSelector).first().not('.' + cls.detailShow).trigger(trg.toggleRow);
             }).unbind(trg.expandAll).bind(trg.expandAll, function() {
                 $table.find(opt.toggleSelector).not('.' + cls.detailShow).trigger(trg.toggleRow);
             }).unbind(trg.collapseAll).bind(trg.collapseAll, function() {
                 $table.find('.' + cls.detailShow).trigger(trg.toggleRow);
             });
             $table.trigger(trg.initialize);
             $window.bind('resize.footable', function() {
                 ft.timers.resize.stop();
                 ft.timers.resize.start(function() {
                     ft.raise(trg.resize);
                 }, opt.delay);
             });
         };
         ft.addRowToggle = function() {
             if (!opt.addRowToggle) return;
             var $table = $(ft.table),
                 hasToggleColumn = false;
             $table.find('span.' + cls.toggle).remove();
             for (var c in ft.columns) {
                 var col = ft.columns[c];
                 if (col.toggle) {
                     hasToggleColumn = true;
                     var selector = '> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > td:nth-child(' + (parseInt(col.index, 10) + 1) + ')';
                     $table.find(selector).not('.' + cls.detailCell).prepend($(opt.toggleHTMLElement).addClass(cls.toggle));
                     return;
                 }
             }
             if (!hasToggleColumn) {
                 $table.find('> tbody > tr:not(.' + cls.detail + ',.' + cls.disabled + ') > td:first-child').not('.' + cls.detailCell).prepend($(opt.toggleHTMLElement).addClass(cls.toggle));
             }
         };
         ft.setColumnClasses = function() {
             $table = $(ft.table);
             for (var c in ft.columns) {
                 var col = ft.columns[c];
                 if (col.className !== null) {
                     var selector = '',
                         first = true;
                     $.each(col.matches, function(m, match) {
                         if (!first) selector += ', ';
                         selector += '> tbody > tr:not(.' + cls.detail + ') > td:nth-child(' + (parseInt(match, 10) + 1) + ')';
                         first = false;
                     });
                     $table.find(selector).not('.' + cls.detailCell).addClass(col.className);
                 }
             }
         };
         ft.bindToggleSelectors = function() {
             var $table = $(ft.table);
             if (!ft.hasAnyBreakpointColumn()) return;
             $table.find(opt.toggleSelector).unbind(trg.toggleRow).bind(trg.toggleRow, function(e) {
                 var $row = $(this).is('tr') ? $(this) : $(this).parents('tr:first');
                 ft.toggleDetail($row);
             });
             $table.find(opt.toggleSelector).unbind('click.footable').bind('click.footable', function(e) {
                 if ($table.is('.breakpoint') && $(e.target).is('td,.' + cls.toggle)) {
                     $(this).trigger(trg.toggleRow);
                 }
             });
         };
         ft.parse = function(cell, column) {
             var parser = opt.parsers[column.type] || opt.parsers.alpha;
             return parser(cell);
         };
         ft.getColumnData = function(th) {
             var $th = $(th),
                 hide = $th.data('hide'),
                 index = $th.index();
             hide = hide || '';
             hide = jQuery.map(hide.split(','), function(a) {
                 return jQuery.trim(a);
             });
             var data = {
                 'index': index,
                 'hide': {},
                 'type': $th.data('type') || 'alpha',
                 'name': $th.data('name') || $.trim($th.text()),
                 'ignore': $th.data('ignore') || false,
                 'toggle': $th.data('toggle') || false,
                 'className': $th.data('class') || null,
                 'matches': [],
                 'names': {},
                 'group': $th.data('group') || null,
                 'groupName': null
             };
             if (data.group !== null) {
                 var $group = $(ft.table).find('> thead > tr.footable-group-row > th[data-group="' + data.group + '"], > thead > tr.footable-group-row > td[data-group="' + data.group + '"]').first();
                 data.groupName = ft.parse($group, {
                     'type': 'alpha'
                 });
             }
             var pcolspan = parseInt($th.prev().attr('colspan') || 0, 10);
             indexOffset += pcolspan > 1 ? pcolspan - 1 : 0;
             var colspan = parseInt($th.attr('colspan') || 0, 10),
                 curindex = data.index + indexOffset;
             if (colspan > 1) {
                 var names = $th.data('names');
                 names = names || '';
                 names = names.split(',');
                 for (var i = 0; i < colspan; i++) {
                     data.matches.push(i + curindex);
                     if (i < names.length) data.names[i + curindex] = names[i];
                 }
             } else {
                 data.matches.push(curindex);
             }
             data.hide['default'] = ($th.data('hide') === "all") || ($.inArray('default', hide) >= 0);
             var hasBreakpoint = false;
             for (var name in opt.breakpoints) {
                 data.hide[name] = ($th.data('hide') === "all") || ($.inArray(name, hide) >= 0);
                 hasBreakpoint = hasBreakpoint || data.hide[name];
             }
             data.hasBreakpoint = hasBreakpoint;
             var e = ft.raise(evt.columnData, {
                 'column': {
                     'data': data,
                     'th': th
                 }
             });
             return e.column.data;
         };
         ft.getViewportWidth = function() {
             return window.innerWidth || (document.body ? document.body.offsetWidth : 0);
         };
         ft.calculateWidth = function($table, info) {
             if (jQuery.isFunction(opt.calculateWidthOverride)) {
                 return opt.calculateWidthOverride($table, info);
             }
             if (info.viewportWidth < info.width) info.width = info.viewportWidth;
             if (info.parentWidth < info.width) info.width = info.parentWidth;
             return info;
         };
         ft.hasBreakpointColumn = function(breakpoint) {
             for (var c in ft.columns) {
                 if (ft.columns[c].hide[breakpoint]) {
                     if (ft.columns[c].ignore) {
                         continue;
                     }
                     return true;
                 }
             }
             return false;
         };
         ft.hasAnyBreakpointColumn = function() {
             for (var c in ft.columns) {
                 if (ft.columns[c].hasBreakpoint) {
                     return true;
                 }
             }
             return false;
         };
         ft.resize = function() {
             var $table = $(ft.table);
             if (!$table.is(':visible')) {
                 return;
             }
             if (!ft.hasAnyBreakpointColumn()) {
                 return;
             }
             var info = {
                 'width': $table.width(),
                 'viewportWidth': ft.getViewportWidth(),
                 'parentWidth': $table.parent().width()
             };
             info = ft.calculateWidth($table, info);
             var pinfo = $table.data('footable_info');
             $table.data('footable_info', info);
             ft.raise(evt.resizing, {
                 'old': pinfo,
                 'info': info
             });
             if (!pinfo || (pinfo && pinfo.width && pinfo.width !== info.width)) {
                 var current = null,
                     breakpoint;
                 for (var i = 0; i < ft.breakpoints.length; i++) {
                     breakpoint = ft.breakpoints[i];
                     if (breakpoint && breakpoint.width && info.width <= breakpoint.width) {
                         current = breakpoint;
                         break;
                     }
                 }
                 var breakpointName = (current === null ? 'default' : current['name']),
                     hasBreakpointFired = ft.hasBreakpointColumn(breakpointName),
                     previousBreakpoint = $table.data('breakpoint');
                 $table.data('breakpoint', breakpointName).removeClass('default breakpoint').removeClass(ft.breakpointNames).addClass(breakpointName + (hasBreakpointFired ? ' breakpoint' : ''));
                 if (breakpointName !== previousBreakpoint) {
                     $table.trigger(trg.redraw);
                     ft.raise(evt.breakpoint, {
                         'breakpoint': breakpointName,
                         'info': info
                     });
                 }
             }
             ft.raise(evt.resized, {
                 'old': pinfo,
                 'info': info
             });
         };
         ft.redraw = function() {
             ft.addRowToggle();
             ft.bindToggleSelectors();
             ft.setColumnClasses();
             var $table = $(ft.table),
                 breakpointName = $table.data('breakpoint'),
                 hasBreakpointFired = ft.hasBreakpointColumn(breakpointName);
             $table.find('> tbody > tr:not(.' + cls.detail + ')').data('detail_created', false).end().find('> thead > tr:last-child > th').each(function() {
                 var data = ft.columns[$(this).index()],
                     selector = '',
                     first = true;
                 $.each(data.matches, function(m, match) {
                     if (!first) {
                         selector += ', ';
                     }
                     var count = match + 1;
                     selector += '> tbody > tr:not(.' + cls.detail + ') > td:nth-child(' + count + ')';
                     selector += ', > tfoot > tr:not(.' + cls.detail + ') > td:nth-child(' + count + ')';
                     selector += ', > colgroup > col:nth-child(' + count + ')';
                     first = false;
                 });
                 selector += ', > thead > tr[data-group-row="true"] > th[data-group="' + data.group + '"]';
                 var $column = $table.find(selector).add(this);
                 if (breakpointName !== '') {
                     if (data.hide[breakpointName] === false) $column.addClass('footable-visible').show();
                     else $column.removeClass('footable-visible').hide();
                 }
                 if ($table.find('> thead > tr.footable-group-row').length === 1) {
                     var $groupcols = $table.find('> thead > tr:last-child > th[data-group="' + data.group + '"]:visible, > thead > tr:last-child > th[data-group="' + data.group + '"]:visible'),
                         $group = $table.find('> thead > tr.footable-group-row > th[data-group="' + data.group + '"], > thead > tr.footable-group-row > td[data-group="' + data.group + '"]'),
                         groupspan = 0;
                     $.each($groupcols, function() {
                         groupspan += parseInt($(this).attr('colspan') || 1, 10);
                     });
                     if (groupspan > 0) $group.attr('colspan', groupspan).show();
                     else $group.hide();
                 }
             }).end().find('> tbody > tr.' + cls.detailShow).each(function() {
                 ft.createOrUpdateDetailRow(this);
             });
             $table.find('> tbody > tr.' + cls.detailShow + ':visible').each(function() {
                 var $next = $(this).next();
                 if ($next.hasClass(cls.detail)) {
                     if (!hasBreakpointFired) $next.hide();
                     else $next.show();
                 }
             });
             $table.find('> thead > tr > th.footable-last-column, > tbody > tr > td.footable-last-column').removeClass('footable-last-column');
             $table.find('> thead > tr > th.footable-first-column, > tbody > tr > td.footable-first-column').removeClass('footable-first-column');
             $table.find('> thead > tr, > tbody > tr').find('> th.footable-visible:last, > td.footable-visible:last').addClass('footable-last-column').end().find('> th.footable-visible:first, > td.footable-visible:first').addClass('footable-first-column');
             ft.raise(evt.redrawn);
         };
         ft.toggleDetail = function(row) {
             var $row = (row.jquery) ? row : $(row),
                 $next = $row.next();
             if ($row.hasClass(cls.detailShow)) {
                 $row.removeClass(cls.detailShow);
                 if ($next.hasClass(cls.detail)) $next.hide();
                 ft.raise(evt.rowCollapsed, {
                     'row': $row[0]
                 });
             } else {
                 ft.createOrUpdateDetailRow($row[0]);
                 $row.addClass(cls.detailShow).next().show();
                 ft.raise(evt.rowExpanded, {
                     'row': $row[0]
                 });
             }
         };
         ft.removeRow = function(row) {
             var $row = (row.jquery) ? row : $(row);
             if ($row.hasClass(cls.detail)) {
                 $row = $row.prev();
             }
             var $next = $row.next();
             if ($row.data('detail_created') === true) {
                 $next.remove();
             }
             $row.remove();
             ft.raise(evt.rowRemoved);
         };
         ft.appendRow = function(row) {
             var $row = (row.jquery) ? row : $(row);
             $(ft.table).find('tbody').append($row);
             ft.redraw();
         };
         ft.getColumnFromTdIndex = function(index) {
             var result = null;
             for (var column in ft.columns) {
                 if ($.inArray(index, ft.columns[column].matches) >= 0) {
                     result = ft.columns[column];
                     break;
                 }
             }
             return result;
         };
         ft.createOrUpdateDetailRow = function(actualRow) {
             var $row = $(actualRow),
                 $next = $row.next(),
                 $detail, values = [];
             if ($row.data('detail_created') === true) return true;
             if ($row.is(':hidden')) return false;
             ft.raise(evt.rowDetailUpdating, {
                 'row': $row,
                 'detail': $next
             });
             $row.find('> td:hidden').each(function() {
                 var index = $(this).index(),
                     column = ft.getColumnFromTdIndex(index),
                     name = column.name;
                 if (column.ignore === true) return true;
                 if (index in column.names) name = column.names[index];
                 values.push({
                     'name': name,
                     'value': ft.parse(this, column),
                     'display': $.trim($(this).html()),
                     'group': column.group,
                     'groupName': column.groupName
                 });
                 return true;
             });
             if (values.length === 0) return false;
             var colspan = $row.find('> td:visible').length;
             var exists = $next.hasClass(cls.detail);
             if (!exists) {
                 $next = $('<tr class="' + cls.detail + '"><td class="' + cls.detailCell + '"><div class="' + cls.detailInner + '"></div></td></tr>');
                 $row.after($next);
             }
             $next.find('> td:first').attr('colspan', colspan);
             $detail = $next.find('.' + cls.detailInner).empty();
             opt.createDetail($detail, values, opt.createGroupedDetail, opt.detailSeparator, cls);
             $row.data('detail_created', true);
             ft.raise(evt.rowDetailUpdated, {
                 'row': $row,
                 'detail': $next
             });
             return !exists;
         };
         ft.raise = function(eventName, args) {
             if (ft.options.debug === true && $.isFunction(ft.options.log)) ft.options.log(eventName, 'event');
             args = args || {};
             var def = {
                 'ft': ft
             };
             $.extend(true, def, args);
             var e = $.Event(eventName, def);
             if (!e.ft) {
                 $.extend(true, e, def);
             }
             $(ft.table).trigger(e);
             return e;
         };
         ft.reset = function() {
             var $table = $(ft.table);
             $table.removeData('footable_info').data('breakpoint', '').removeClass(cls.loading).removeClass(cls.loaded);
             $table.find(opt.toggleSelector).unbind(trg.toggleRow).unbind('click.footable');
             $table.find('> tbody > tr').removeClass(cls.detailShow);
             $table.find('> tbody > tr.' + cls.detail).remove();
             ft.raise(evt.reset);
         };
         ft.init();
         return ft;
     }
 })(jQuery, window);