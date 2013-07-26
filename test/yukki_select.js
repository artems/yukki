var Yukki = require('../lib/yukki').Yukki;
var expect = require('chai').expect;

describe('Yukki', function() {
    describe('#select()', function() {
        describe('`self\' axis', function() {
            it('should return context', function() {
                var data = { A: 10 };
                var query = ['self', { A: 10 }]
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should return an empty array if nothing found', function () {
                var data = { A: 10 };
                var query = ['self', { B: 10 }]
                expect(Yukki.select(data, query)).to.have.length(0);
            });
        });

        describe('`child\' axis', function() {
            it('should return children', function() {
                var data = { A: { B: 20 } };
                var query = ['child', { B: 20 }]
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should return an empty array if nothing found', function () {
                var data = { A: { B: 20 } };
                var query = ['child', { A: { $exists: true } }]
                expect(Yukki.select(data, query)).to.have.length(0);
            });
        });

        describe('`parent\' axis', function() {
            it('should return parent', function() {
                var data = { A: { B: 20 } };
                var query = [['child', {}], ['parent', { A: { $exists: true } }]]
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should return an empty array if nothing found', function () {
                var data = { A: { B: 20 } };
                var query = [['child', {}], ['parent', { B: { $exists: true } }]]
                expect(Yukki.select(data, query)).to.have.length(0);
            });
        });

        describe('`ancestor\' axis', function() {
            it('should return ancestors', function() {
                var data = { A: { B: { C: 20 } } };
                var query = [['child', {}], ['child', {}], ['ancestor', { A: { $exists: true } }]]
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should return an empty array if nothing found', function () {
                var data = { A: { B: { C: 20 } } };
                var query = [['child', {}], ['child', {}], ['ancestor', { C: { $exists: true } }]]
                expect(Yukki.select(data, query)).to.have.length(0);
            });
        });

        describe('`descendant\' axis', function() {
            it('should search through object', function () {
                var data = { A: { B: { C: 20 } } };
                var query = [['descendant', { C: 20 }]];
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should search through array', function () {
                var data = [[{ A: 10 }], [{ B: 20 }], [{ C: 30 }]];
                var query = [['descendant', { C: 30 }]];
                expect(Yukki.select(data, query)).to.have.length(1);
            });

            it('should return an empty array if nothing found', function () {
                var data = { A: { B: { C: 20 } } };
                var query = [['descendant', { D: 30 }]];
                expect(Yukki.select(data, query)).to.have.length(0);
            });
        });

        it('should use `child\' axis by default', function() {
            var data = { A: { B: 20 } };
            var query = { B: { $exists: true } }
            expect(Yukki.select(data, query)).to.have.length(1);
        });

        it('should accept many steps', function() {
            var data = { A: { B: { C: 20 } } };
            var query = [
                ['self', { A: { $exists: true } }],
                ['child', { B: { $exists: true } }],
                ['child', { C: { $eq: 20 } }]
            ];
            expect(Yukki.select(data, query)).to.have.length(1);
        });

        it('should return all matched values', function() {
            var data = {
                A: [
                    { A: 7 }, { A: 14 }, { A: 21 }
                ],
                B: [
                    { A: 5 }, { A: 10 }, { A: 15 },
                ],
                C: { A: 20, B: 25, C: 30 }
            };
            var query = [
                ['child', { $type: 'array' }],
                ['child', { A: { $gte: 10 } }],
                ['child', {}]
            ];
            expect(Yukki.select(data, query)).to.have.length(4);
        });

        it('should return an empty array if context is not object or array', function() {
            var data = 10;
            var query = [['child', {}]];
            expect(Yukki.select(data, query)).to.have.length(0);
        });
    });
});
