var Yukki = require('../lib/yukki').Yukki;
var expect = require('chai').expect;

describe('Yukki', function() {
    describe('#func()', function() {
        afterEach(function() {
            Yukki.clean();
        });

        it('should create named function', function() {
            Yukki.func('my-func', function() { return 'worked!'; });
            expect(Yukki.call_func('my-func')).to.be.equal('worked!');
        });

        it('should create function with arguments', function() {
            Yukki.func('my-func', function(a, b, c) { return a + b + c; });
            expect(Yukki.call_func('my-func', {}, 'A', 'B', 'C')).to.be.equal('ABC');
        });

        describe('__base', function() {
            it('should call old version of function with the same name', function() {
                Yukki.func('my-func', function() { return 'A'; });
                Yukki.func('my-func', function() { return this.__base() + 'B'; });
                expect(Yukki.call_func('my-func')).to.be.equal('AB');
            });

            it('should return undefined if no another function with the same name', function() {
                Yukki.func('my-func', function() { return this.__base() === undefined ? 'A' : 'B'; });
                expect(Yukki.call_func('my-func')).to.be.equal('A');
            });

            it('should correct work with nested calls', function() {
                Yukki.func('my-func-A', function() { return 'A'; });
                Yukki.func('my-func-B', function() { return this.call_func('my-func-A', this) + 'B'; });
                expect(Yukki.call_func('my-func-B', Yukki)).to.be.equal('AB');

                Yukki.func('my-func-A', function() {
                    return this.__base() + 'A';
                });
                Yukki.func('my-func-B', function() {
                    var A = this.call_func('my-func-A', this);
                    var B = this.__base() + 'B';
                    return A + B;
                });
                expect(Yukki.call_func('my-func-B', Yukki)).to.be.equal('AAAABB');
            });
        });
    });
});
