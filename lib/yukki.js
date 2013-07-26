'use strict';

var _shelf = {};

function Yukki() {
    var global = (function() { return this; })();

    if (this === global) {
        return new Yukki();
    }

    this._rule = {};
    this._func = [];

    return this;
}

Yukki.clean = function() {
    _shelf = {};
};

Yukki.document = function(name) {
    var doc = _shelf[name];

    if (!doc) {
        doc = new Yukki();
        _shelf[name] = doc;
    }

    return doc;
};

Yukki.run = function(ctx, mode) {
    return Yukki.document('_default').run(ctx, mode);
};

Yukki.func = function(name, body) {
    return Yukki.document('_default').func(name, body);
};

Yukki.call_func = function(name, ctx) {
    var args = Array.prototype.slice.call(arguments, 0);
    name = args.shift();
    ctx = args.shift() || {};
    return Yukki.document('_default').call_func(name, ctx, args);
};

Yukki.check = function(ctx, path) {
    return Yukki.document('_default').check(ctx, path);
};

Yukki.select = function(ctx, path) {
    return Yukki.document('_default').select(ctx, path);
};

Yukki.match = function(path, mode, body) {
    return Yukki.document('_default').match(path, mode, body);
};

Yukki.prototype.match = function(path, mode, body) {
    if (!Array.isArray(path)) {
        path = (this.type(path) === 'object') ? [path] : [];
    }
    if (typeof mode === 'function') {
        mode = 'default';
        body = arguments[1];
    }
    if (typeof mode === 'undefined') {
        mode = 'default';
    }
    if (typeof body === 'undefined') {
        body = function () { return undefined; };
    }

    var xpath = this.reverse_path(path);
    var specificity = this.calc_specificity(xpath);
    this.add_rule(xpath, mode, body, specificity);

    return this;
};

Yukki.prototype.type = function(ctx) {
    var type = typeof ctx;
    if (type === 'object') {
        if (ctx === null)
            type = 'null';
        else if (Array.isArray(ctx))
            type = 'array';
    }

    return type;
};

Yukki.prototype.empty = function(ctx) {
    switch (this.type(ctx)) {
    case 'string':
        return ctx === '';

    case 'array':
        return ctx.length === 0;

    case 'object':
        return Object.keys(ctx).length === 0;

    case 'null':
    case 'undefined':
        return true;

    default:
        return false;
    }
};

Yukki.prototype.reverse_path = function(path) {
    var step;
    var xpath = [];

    if (path.length === 0) {
        return [];
    }

    var axis = 'self';
    for (var i = path.length - 1; i >= 0; i--) {
        step = path[i];
        if (Array.isArray(step)) {
            if (step[0] !== 'child')
                throw new YukkiError('Yukki: match: only \'child\' axis is allowed in a pattern outside predicates');
            step = step[1];
        }
        xpath.push([axis, step]);
        axis = 'parent';
    }

    return xpath;
};

Yukki.prototype.calc_specificity = function(path) {
    var value = 0;

    for (var i = 0, len = path.length; i < len; i++) {
        var step = path[i][1];
        if (!this.empty(step)) {
            value++;
        }
    }

    return value;
};

Yukki.prototype.add_rule = function(path, mode, body, specificity) {
    if (!Array.isArray(this._rule[mode])) {
        this._rule[mode] = [];
    }

    var rule_set = this._rule[mode];
    for (var i = 0, len = rule_set.length; i < len; i++) {
        var rule = rule_set[i];
        if (rule.specificity <= specificity) {
            break;
        }
    }

    var new_rule = { path: path, body: body, specificity: specificity };
    rule_set.splice(i, 0, new_rule);
};

Yukki.prototype.run = function(ctx, mode) {
    return this.apply_self(ctx, mode || 'default', []);
};

Yukki.prototype.apply_self = function(ctx, mode, ancestor) {
    mode = mode || 'default';
    var env = this.create_env(ctx, mode, -1, ancestor);
    return this.apply_next(ctx, mode, ancestor, env);
};

Yukki.prototype.create_env = function(ctx, mode, index, ancestor) {
    var env;

    env = new YukkiEnv();
    env._ctx = ctx;
    env._mode = mode;
    env._index = index;
    env._yukki = this;
    env._ancestor = ancestor;

    return env;
};

Yukki.prototype.buildin_rule = function(ctx, mode, ancestor) {
    switch (this.type(ctx)) {
    case 'array':
    case 'object':
        return this.apply_child(ctx, mode, ancestor);

    case 'null':
    case 'function':
    case 'undefined':
        return undefined;

    case 'string':
    case 'number':
    case 'boolean':
        return ctx;

    default:
        return undefined;
    }
};

Yukki.prototype.apply_next = function(ctx, mode, ancestor, env) {
    mode = mode || 'default';

    var index = env._index + 1;
    var rule_set = this._rule[mode] || [];

    for (var i = index, len = rule_set.length; i < len; i++) {
        var path = rule_set[i].path;
        var is_valid = this.select(ctx, path, ancestor);

        if (is_valid.length > 0) {
            env._index = i;
            var body = rule_set[i].body;
            var result = body.call(env, ctx);
            return result;
        }
    }

    return this.buildin_rule(ctx, mode, ancestor);
};

Yukki.prototype.apply_child = function(ctx, mode, ancestor) {
    mode = mode || 'default';
    ancestor = ancestor || [];

    var i, len, tmp, copy;
    var ancestor_copy;

    switch (this.type(ctx)) {
    case 'array':
        copy = [];

        for (i = 0, len = ctx.length; i < len; i++) {
            ancestor_copy = ancestor.slice(0);
            ancestor_copy.push({ node: ctx, type: 'array', key: i });

            tmp = this.apply_self(ctx[i], mode, ancestor_copy);
            if (tmp !== undefined) {
                copy.push(tmp);
            }
        }
        return (copy.length === 0) ? undefined : copy;

    case 'object':
        copy = {};
        var keys = Object.keys(ctx);
        var empty = true;

        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            ancestor_copy = ancestor.slice(0);
            ancestor_copy.push({ node: ctx, type: 'object', key: key });

            tmp = this.apply_self(ctx[key], mode, ancestor_copy);
            if (tmp !== undefined) {
                empty = false;
                copy[key] = tmp;
            }
        }
        return empty ? undefined : copy;

    default:
        return this.buildin_rule(ctx, mode, ancestor);
    }
};

Yukki.prototype.apply_ctx = function(ctx, mode, ancestor, ancestor_chain) {
    mode = mode || 'default';

    if (!Array.isArray(ancestor_chain)) {
        throw new YukkiError('Yukki: apply_ctx: wrong agrument `ancestor_chain\'');
    }

    var ancestor_copy = ancestor.slice(0);
    for (var i = 0, len = ancestor_chain.length; i < len; i++) {
        var key = ancestor_chain[i];

        switch (this.type(ctx)) {
        case 'array':
            ancestor_copy.push({ node: ctx, type: 'array', key: key });
            break;
        case 'object':
            ancestor_copy.push({ node: ctx, type: 'object', key: key });
            break;
        default:
            throw new YukkiError('Yukki: apply_ctx: wrong argument `ancestor_chain\'');
        }
        ctx = ctx[key];
    }

    return this.apply_self(ctx, mode, ancestor_copy);
};

Yukki.prototype.select = function(ctx, path, ancestor) {
    ancestor = ancestor || [];
    var scope = [[ctx, ancestor]];
    var tmp_scope = [];
    var axis_scope = [];

    if (!Array.isArray(path)) {
        path = [path];
    }

    if (Array.isArray(path)) {
        if (path[0] === 'self' || path[0] === 'child' ||
            path[0] === 'parent' || path[0] === 'ancestor' ||
            path[0] === 'descendant')
        {
            path = [path];
        }
    }

    for (var i = 0, len = path.length; i < len; i++) {
        var step = path[i];
        var axis = 'child';

        if (Array.isArray(step)) {
            axis = step[0] || axis;
            step = step[1] || {};
        }

        tmp_scope = [];
        axis_scope = [];
        for (var j = 0, len1 = scope.length; j < len1; j++) {
            var tmp_ctx = scope[j][0];
            var tmp_ancestor = scope[j][1];

            switch (axis) {
            case 'self':
                if (this.check(tmp_ctx, step, tmp_ancestor))
                    axis_scope = [[tmp_ctx, tmp_ancestor]];
                break;
            case 'child':
                axis_scope = this.select_child(tmp_ctx, step, tmp_ancestor);
                break;
            case 'parent':
                axis_scope = this.select_parent(tmp_ctx, step, tmp_ancestor);
                break;
            case 'ancestor':
                axis_scope = this.select_ancestor(tmp_ctx, step, tmp_ancestor);
                break;
            case 'descendant':
                axis_scope = this.select_descendant(tmp_ctx, step, tmp_ancestor);
                break;
            }
            tmp_scope = tmp_scope.concat(axis_scope);
        }

        if (tmp_scope.length === 0) {
            return [];
        }

        scope = tmp_scope;
    }

    /*
    var result = [];
    for (i = 0, len = scope.length; i < len; i++) {
        result.push(scope[i][0]);
    }
    return result;
    */

    return scope;
};

Yukki.prototype.select_child = function(ctx, path, ancestor) {
    var i, len;
    var scope = [];
    var ancestor_copy;

    switch (this.type(ctx)) {
    case 'array':
        for (i = 0, len = ctx.length; i < len; i++) {
            ancestor_copy = ancestor.slice(0);
            ancestor_copy.push({ node: ctx, type: 'array', key: i });

            if (this.check(ctx[i], path, ancestor_copy)) {
                scope.push([ctx[i], ancestor_copy]);
            }
        }
        return scope;

    case 'object':
        var keys = Object.keys(ctx);
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            ancestor_copy = ancestor.slice(0);
            ancestor_copy.push({ node: ctx, type: 'object', key: key });

            if (this.check(ctx[key], path, ancestor_copy)) {
                scope.push([ctx[key], ancestor_copy]);
            }
        }
        return scope;

    default:
        return [];
    }
};

Yukki.prototype.select_parent = function(ctx, path, ancestor) {
    var scope = [];
    if (ancestor.length === 0)
        return [];

    var node = ancestor[ancestor.length - 1].node;
    var ancestor_copy = ancestor.slice(0, -1);
    if (this.check(node, path, ancestor_copy))
        scope = [[node, ancestor_copy]];

    return scope;
};

Yukki.prototype.select_ancestor = function(ctx, path, ancestor) {
    var node;
    var scope = [];

    if (ancestor.length === 0)
        return [];

    var ancestor_copy = ancestor;
    for (var i = ancestor.length - 1; i >= 0; i--) {
        node = ancestor[i].node;
        ancestor_copy = ancestor_copy.slice(0, -1);
        if (this.check(node, path, ancestor_copy))
            scope.push([node, ancestor_copy]);
    }

    return scope;
};

Yukki.prototype.select_descendant = function(ctx, path, ancestor, scope) {
    scope = scope || [];
    var i, len;

    var child = this.select_child(ctx, path, ancestor);
    for (i = 0, len = child.length; i < len; i++) {
        scope.push(child[i]);
    }

    switch (this.type(ctx)) {
    case 'array':
        for (i = 0, len = ctx.length; i < len; i++) {
            this.select_descendant(ctx[i], path, ancestor, scope);
        }
        return scope;
    case 'object':
        var keys = Object.keys(ctx);
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            this.select_descendant(ctx[key], path, ancestor, scope);
        }
        return scope;
    default:
        return [];
    }
};

Yukki.prototype.check = function(ctx, path, ancestor) {
    ancestor = ancestor || [];

    if (this.type(path) !== 'object') {
        return ctx === path;
    }

    var keys = Object.keys(path);
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        if (!this.checkOne(ctx, path, key, ancestor)) {
            return false;
        }
    }

    return true;
};

Yukki.prototype.checkOne = function(ctx, path, key, ancestor) {
    var i, len, type, parent, ancestor_copy;
    var arg = path[key];

    switch (key) {
    case '$in':
    case '$or':
    case '$nin':
    case '$all':
    case '$nor':
    case '$and':
        if (!Array.isArray(arg))
            throw new YukkiError('Yukki: check: value of ' + key + ' should be an array');
    }

    switch (key) {
    case '$eq':
        return ctx === arg;
    case '$ne':
        return ctx !== arg;
    case '$gt':
        return ctx > arg;
    case '$gte':
        return ctx >= arg;
    case '$lt':
        return ctx < arg;
    case '$lte':
        return ctx <= arg;
    case '$in':
        return arg.indexOf(ctx) !== -1;
    case '$nin':
        return arg.indexOf(ctx) === -1;
    case '$not':
        return !this.check(ctx, arg, ancestor);
    case '$empty':
        return this.empty(ctx) === arg;
    case '$exists':
        return Boolean(ctx) === arg;

    case '$type':
        type = this.type(ctx);

        if (arg === 'simple') {
            return type === 'boolean' ||
                   type === 'number'  ||
                   type === 'string';
        } else if (arg === 'complex') {
            return type === 'object' ||
                   type === 'array';
        }
        return arg === type;

    case '$all':
        if (!Array.isArray(ctx)) {
            if (arg.length !== 1)
                return false;
            return (arg[0] === ctx);
        }
        for (i = 0, len = arg.length; i < len; i++) {
            if (ctx.indexOf(arg[i]) === -1)
                return false;
        }
        return true;

    case '$any':
        if (!Array.isArray(ctx)) {
            for (i = 0, len = arg.length; i < len; i++) {
                if (ctx === arg[i])
                    return true;
            }
            return false;
        }
        for (i = 0, len = arg.length; i < len; i++) {
            if (ctx.indexOf(arg[i]) > -1)
                return true;
        }
        if (len === 0) {
            return true;
        }
        return false;

    case '$or':
        if (arg.length === 0) {
            return true;
        }
        for (i = 0, len = arg.length; i < len; i++) {
            if (this.check(ctx, arg[i], ancestor))
                return true;
        }
        return false;

    // TODO
    // case '$nor':

    case '$and':
        for (i = 0, len = arg.length; i < len; i++) {
            if (!this.check(ctx, arg[i], ancestor))
                return false;
        }
        return true;

    case '$position':
        parent = ancestor[ancestor.length - 1];
        if (!parent)
            return false;
        if (this.type(arg) === 'object')
            return this.check(parent.key, arg, []);

        return parent.key === arg;

    case '$elem_match':
        if (!Array.isArray(ctx))
            return false;

        for (i = 0, len = ctx.length; i < len; i++) {
            ancestor_copy = ancestor.slice(0);
            ancestor_copy.push({ node: ctx, type: 'array', key: i });
            if (this.check(ctx[i], arg, ancestor_copy))
                return true;
        }
        return false;

    case '$child':
        return this.select(ctx, ['child', arg], ancestor).length > 0;

    case '$parent':
        return this.select(ctx, ['parent', arg], ancestor).length > 0;

    case '$ancestor':
        return this.select(ctx, ['ancestor', arg], ancestor).length > 0;

    case '$descendant':
        return this.select(ctx, ['descendant', arg], ancestor).length > 0;

    default:
        type = this.type(ctx);
        if (type !== 'object') {
            return false;
        }

        if (key[0] === '$') {
            key = key.substr(1);
        }

        ancestor_copy = ancestor.slice(0);
        ancestor_copy.push({ node: ctx, type: type, key: key });
        return this.check(ctx[key], arg, ancestor_copy);
    }
};

Yukki.prototype.func = function(name, body) {
    var base = this._func[name] || function() {};
    var func = function() {
        var old = this.__base;
        this.__base = base;
        var result = body.apply(this, arguments);
        this.__base = old;
        return result;
    };

    this._func[name] = func;

    return this;
};

Yukki.prototype.call_func = function(name, ctx, args) {
    var func = this._func[name];
    if (!func) {
        throw new YukkiError('Yukki: call_func: function `' + name + '\' not found');
    }
    return func.apply(ctx, args);
};

module.exports.Yukki = Yukki;


function YukkiEnv() {
    this._ctx = null;
    this._mode = 'default';
    this._yukki = null;
    this._index = 0;
    this._ancestor = [];
}

YukkiEnv.prototype.value_of = function(path) {
    var scope = this._yukki.select(this._ctx, path, this._ancestor);
    var result = [];
    for (var i = 0, len = scope.length; i < len; i++) {
        result.push(scope[i][0]);
    }
    return result;
};

YukkiEnv.prototype.select = function(path) {
    var list = new YukkiValueList();
    var select = this._yukki.select(this._ctx, path, this._ancestor);

    list._list = select;
    list._yukki = this._yukki;

    return list;
};

YukkiEnv.prototype.apply_self = function(mode) {
    mode = mode || 'default';
    return this._yukki.apply_self(this._ctx, mode, this._ancestor);
};

YukkiEnv.prototype.apply_child = function(mode) {
    mode = mode || 'default';
    return this._yukki.apply_child(this._ctx, mode, this._ancestor);
};

YukkiEnv.prototype.apply_next = function() {
    return this._yukki.apply_next(this._ctx, this._mode, this._ancestor, this);
};

YukkiEnv.prototype.apply_ctx = function(ctx, mode, ancestor_chain) {
    mode = mode || 'default';
    return this._yukki.apply_ctx(this._ctx, mode, this._ancestor, ancestor_chain);
};

YukkiEnv.prototype.call_func = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var name = args.shift();

    return this._yukki.call_func(name, this, args);
};

YukkiEnv.prototype.string = function(ctx) {
    var type = this._yukki.type(ctx);
    switch (type) {
    case 'array':
        return ctx.join(',');
    case 'object':
        return JSON.stringify(ctx);
    case 'string':
        return ctx;
    case 'number':
        return String(ctx);
    case 'boolean':
        return ctx ? 'true' : 'false';
    case 'null':
    case 'undefined':
        return '';
    default:
        return Object.prototype.toString.call(ctx);
    }
};

module.exports.YukkiEnv = YukkiEnv;


function YukkiValueList() {
    this._list = [];
    this._yukki = null;
}

YukkiValueList.prototype.apply = function(mode) {
    var result = [];

    for (var i = 0, len = this._list.length; i < len; i++) {
        var ctx = this._list[i][0];
        var ancestor = this._list[1];
        var apply_result = this._yukki.apply_self(ctx, mode, ancestor);
        result.push(apply_result);
    }

    return result;
};


function YukkiError(message) {
    this.name = 'YukkiError';
    this.message = message || 'Yukki: unknown error';
}

YukkiError.prototype = new Error();
YukkiError.prototype.constructor = YukkiError;

module.exports.YukkiError = YukkiError;

