var Yukki = require('./yukki.js').Yukki;

Yukki.match({ $or: [{ blk: { $exists: true } }, { elm: { $exists: true } }] }, function() {
    var tag = this.apply_self('lego:tag');
    var class_name = this.apply_self('lego:block-class');

    var content = this.string(this.apply_self('lego:content'));
    var open_tag = '<' + tag + ' class="' + class_name + '">';
    var close_tag = '</' + tag + '>';

    return open_tag + content  + close_tag;
});

Yukki.match({ con: { $exists: true } }, 'lego:content', function(ctx) {
    return this.apply_ctx(ctx.con, 'default', ['con']);
});

Yukki.match({ $or: [{ blk: { $exists: true } }, { elm: { $exists: true } }] }, 'lego:tag', function() {
    return 'div';
});

Yukki.match({ $type: 'object' }, 'lego:block-class', function() {
    var self_name = this.apply_self('lego:block-class-name');

    var mod_name = this.apply_self('lego:block-class-modifier') || [];
    var mod_class = [];
    for (var i = 0; i < mod_name.length; i++) {
        var tmp = this.call_func('lego:block-mod-name', self_name, mod_name[i]);
        mod_class.push(tmp);
    }
    mod_class = mod_class.length > 0 ? ' ' + mod_class.join(' ') : '';

    var js_class = this.apply_self('lego:block-class-js') || '';
    var mix_class = this.apply_self('lego:block-class-mixin') || '';
    var custom_class = this.apply_self('lego:block-class-custom') || '';

    return self_name + mod_class + mix_class + js_class + custom_class;
});

Yukki.match({}, 'lego:block-class-name', function(ctx) {
    return this.call_func('lego:name', ctx);
});

Yukki.match({}, 'lego:block-class-modifier');
Yukki.match({ mod: { $type: 'object' } }, 'lego:block-class-modifier', function(ctx) {
    var mod_name = [];
    var mod_keys = Object.keys(ctx.mod);
    for (var i = 0; i < mod_keys.length; i++) {
        var key = mod_keys[i];
        var tmp = this.call_func('lego:mod-name', key, ctx.mod[key]);
        mod_name.push(this.string(tmp));
    }
    return mod_name;
});

Yukki.match({}, 'lego:block-class-mixin');
Yukki.match({ mix: { $type: 'array' } }, 'lego:block-class-mixin', function(ctx) {
    var mix_name = [];
    for (var i = 0; i < ctx.mix.length; i++) {
        var tmp = this.apply_ctx(ctx.mix[i], 'lego:block-class', ['mix', i]);
        mix_name.push(tmp);
    }
    return mix_name.length > 0 ? ' ' + mix_name.join(' ') : '';
});

Yukki.match({}, 'lego:block-class-js');
Yukki.match({ js: { $empty: false } }, 'lego:block-class-js', function(ctx) {
    return ctx.js !== false ? ' i-bem' : '';
});

Yukki.match({ cls: { $empty: false, $type: 'string' } }, 'lego:block-class-custom', function(ctx) {
    return ' ' + ctx.cls;
});

Yukki.match({ blk: 'b-link' }, 'lego:tag', function() {
    return 'a';
});

Yukki.func('lego:name', function(ctx) {
    var block = ctx.blk || '';
    var elem = ctx.elm || '';

    if (block && !elem) {
        return block;
    } else if (block && elem) {
        return block + '__' + elem;
    } else if (!block && elem) {
        var parent = this.value_of(['ancestor', { blk: { $exists: true } }]);
        block = (parent.length === 0) ? '' : parent[0].blk;
        return block + '__' + elem;
    } else {
        return '';
    }
});

Yukki.func('lego:mod-name', function(key, val) {
    return key + '_' + val;
});

Yukki.func('lego:block-mod-name', function(block, mod) {
    return block + '_' + mod;
});

