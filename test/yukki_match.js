var Yukki = require('../lib/yukki').Yukki;
var expect = require('chai').expect;

// prority
// apply
describe('Yukki', function() {
    describe('#match()', function() {
        afterEach(function() {
            Yukki.clean();
        });

        describe('mode', function() {
            it('default mode is `default\'', function() {
                Yukki.match({}, function() { return 'A'; });

                expect(Yukki.run({})).to.equal('A');
                expect(Yukki.run({}, 'default')).to.equal('A');
                expect(Yukki.run({}, 'mode-A')).to.be.undefined;
            });

            it('should apply template when run with the same mode', function() {
                Yukki.match({}, function() { return 'A'; });
                Yukki.match({}, 'mode-B', function() { return 'B'; });
                Yukki.match({}, 'mode-C', function() { return 'C'; });

                expect(Yukki.run({}, 'mode-B')).to.equal('B');
            });
        });

        describe('build-in template', function() {
            it('for number, string or boolean is the value', function() {
                expect(Yukki.run(10)).to.equal(10);
                expect(Yukki.run('A')).to.equal('A');
                expect(Yukki.run(true)).to.equal(true);
            });

            it('for array is the array without undefined values', function() {
                expect(Yukki.run([10, 20, 30])).to.deep.equal([10, 20, 30]);
                expect(Yukki.run([10, undefined, 29])).to.have.length(2);
            });

            it('for empty array is undefined', function() {
                expect(Yukki.run([])).to.be.undefined;
            });

            it('for object is the object without undefined keys', function() {
                expect(Yukki.run({ A: 10, B: 20 })).to.deep.equal({ A: 10, B: 20 });
                expect(Yukki.run({ A: 10, B: undefined })).to.deep.equal({ A: 10 });
            });

            it('for empty object is undefined', function() {
                expect(Yukki.run({})).to.be.undefined;
            });

            it('should return copy of context if no one template was created', function() {
                var data = { A: { B: ['C'], D: 10 } };
                expect(Yukki.run(data)).to.not.equal(data);
                expect(Yukki.run(data)).to.deep.equal(data);
            });
        });

        describe('template without body', function() {
            it('should return undefined', function() {
                var data = { A: { B: ['C'], D: 10 } };
                Yukki.match({ $type: 'number' });
                expect(Yukki.run(data)).to.deep.equal({ A: { B: ['C'] } });

                Yukki.match({ $type: 'string' });
                expect(Yukki.run(data)).to.be.undefined;
            });
        });

        describe('modifies the data by templates', function() {
            it('(test 1)', function() {
                var data = { A: { B: ['C'], D: 10 } };
                Yukki.match({ $type: 'number' }, function(ctx) {
                    return { number: ctx };
                });

                Yukki.match({ $type: 'string' }, function(ctx) {
                    return { string: ctx };
                });

                var result = { A: { B: [{ string: 'C' }], D: { number: 10 } } };
                expect(Yukki.run(data)).to.deep.equal(result);
            });
        });

        describe('select#apply', function() {
            it('(test 1)', function() {
                var data = { A: { B: ['C'], D: 10 } };
                Yukki.match({ $type: 'number' }, function(ctx) {
                    var parent = this.select(['parent', {}]).apply('name');
                    return parent + ':' + ctx;
                });

                Yukki.match({ $type: 'object' }, 'name', function(ctx) {
                    return Object.keys(ctx).join(',');
                });

                var result = { A: { B: ['C'], D: 'B,D:10' } };
                expect(Yukki.run(data)).to.deep.equal(result);
            });
        });
    });
});
