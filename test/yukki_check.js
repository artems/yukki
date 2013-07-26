var Yukki = require('../lib/yukki').Yukki;
var expect = require('chai').expect;

describe('Yukki', function() {
    describe('#check()', function() {
        it('should return true if the `path\' is empty object', function() {
            expect(Yukki.check({}, {})).to.be.ok;
        });

        it('should use strict comparison', function() {
            var data = { A: { B: { C: 10 } } };
            var query = { A: { B: { C: '10' } } };
            expect(Yukki.check(data, query)).to.not.be.ok;
        });

        it('should use deep comparison (true)', function() {
            var data = { A: { B: { C: 10 } } };
            var query = { A: { B: { C: 10 } } };
            expect(Yukki.check(data, query)).to.be.ok;
        });

        it('should use deep comparison (false)', function() {
            var data = { A: { B: { C: 10 } } };
            var query = { A: { B: { C: 20 } } };
            expect(Yukki.check(data, query)).to.not.be.ok;
        });

        it('should comparison simple types', function() {
            expect(Yukki.check(10, 10)).to.be.ok;
            expect(Yukki.check(10, 20)).to.not.be.ok;
            expect(Yukki.check('A', 'A')).to.be.ok;
            expect(Yukki.check('A', 'B')).to.not.be.ok;
        });

        it('should not throw exception if ctx is not an object and path is an object', function() {
            var data = 0;
            var query = { A: { $exsits: false } };
            expect(Yukki.check(data, query)).to.not.be.ok;
        });

        it('should accept escaping keys via $', function() {
            var data = { $all: 10 };
            var query = { $$all: 10 };
            expect(Yukki.check(data, query)).to.be.ok;
        });

        describe('$exists', function() {
            it('($exists: true) should return true if key exists', function() {
                var data = { A: 10 };
                var query = { A: { $exists: true } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('($exists: true) should return false if key does not exists', function() {
                var data = { A: 10 };
                var query = { B: { $exists: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('($exists: false) should return true if key does not exists', function() {
                var data = { A: 10 };
                var query = { B: { $exists: false } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('($exists: false) should return false if key exists', function() {
                var data = { A: 10 };
                var query = { A: { $exists: false } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$gt', function() {
            it('should return true if value greater then specified', function() {
                var data = { A: 10 };
                var query = { A: { $gt: 5 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value less then specified', function() {
                var data = { A: 10 };
                var query = { A: { $gt: 15 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$gte', function() {
            it('should return true if value greater or equal then specified', function() {
                var data = { A: 10 };
                var query = { A: { $gte: 5 } };
                expect(Yukki.check(data, query)).to.be.ok;

                var data1 = { A: 10 };
                var query1 = { A: { $gte: 10 } };
                expect(Yukki.check(data1, query1)).to.be.ok;
            });

            it('should return false if value less then specified', function() {
                var data = { A: 10 };
                var query = { A: { $gte: 15 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$lt', function() {
            it('should return true if value less then specified', function() {
                var data = { A: 10 };
                var query = { A: { $lt: 15 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value greater then specified', function() {
                var data = { A: 10 };
                var query = { A: { $lt: 5 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$lte', function() {
            it('should return true if value less or equal then specified', function() {
                var data = { A: 10 };
                var query = { A: { $lte: 15 } };
                expect(Yukki.check(data, query)).to.be.ok;

                var data1 = { A: 10 };
                var query1 = { A: { $lte: 10 } };
                expect(Yukki.check(data1, query1)).to.be.ok;
            });

            it('should return false if value greater then specified', function() {
                var data = { A: 10 };
                var query = { A: { $lte: 5 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$eq', function() {
            it('should return true if value equal to specified', function() {
                var data = { A: 10 };
                var query = { A: { $eq: 10 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value not equal to specified', function() {
                var data = { A: 10 };
                var query = { A: { $eq: 15 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$ne', function() {
            it('should return true if value not equal to specified', function() {
                var data = { A: 10 };
                var query = { A: { $ne: 15 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value equal to specified', function() {
                var data = { A: 10 };
                var query = { A: { $ne: 10 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$in', function() {
            it('should return true if value in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $in: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is first item in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $in: [10, 20, 30, 40, 50] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is last item in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $in: [0, 5, 10] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value in the argument and argument have only one value', function() {
                var data = { A: 10 };
                var query = { A: { $in: [10] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value not in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $in: [1, 3, 5, 9, 11, 13, 15, 17, 19, 21] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('should return false if the argument is an empty array', function() {
                var data = { A: 10 };
                var query = { A: { $in: [] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('search using strict comparison', function() {
                var data = { A: 10 };
                var query = { A: { $in: ['10'] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$nin', function() {
            it('should return true if value not in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $nin: [1, 3, 5, 9, 11, 13, 15, 17, 19, 21] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if the argument is an empty array', function() {
                var data = { A: 10 };
                var query = { A: { $nin: [] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value in the argument', function() {
                var data = { A: 10 };
                var query = { A: { $nin: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('search using strict comparison', function() {
                var data = { A: 10 };
                var query = { A: { $nin: ['10'] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });
        });

        describe('$not', function() {
            it('should invert return value', function() {
                var data = { A: 10 };
                var query = { A: { $not: { $eq: 10 } } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$empty', function() {
            it('should return true if value is empty string', function() {
                var data = { A: '' };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is empty array', function() {
                var data = { A: [] };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is empty object', function() {
                var data = { A: {} };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is null', function() {
                var data = { A: null };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value is number', function() {
                var data = { A: 0 };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: 1 };
                var query1 = { A: { $empty: true } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;

                var data2 = { A: -1 };
                var query2 = { A: { $empty: true } };
                expect(Yukki.check(data2, query2)).to.not.be.ok;
            });

            it('should return false if value is boolean', function() {
                var data = { A: true };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: false };
                var query1 = { A: { $empty: true } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;
            });

            it('should return false if value is not empty string', function() {
                var data = { A: 'A' };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('should return false if value is not empty array', function() {
                var data = { A: [1, 2, 3] };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: [''] };
                var query1 = { A: { $empty: true } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;
            });

            it('should return false if value is not empty object', function() {
                var data = { A: { B: {} } };
                var query = { A: { $empty: true } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$type', function() {
            it('should return true if value of type as specified', function() {
                var data = { A: 10 };
                var query = { A: { $type: 'number' } };
                expect(Yukki.check(data, query)).to.be.ok;

                var data1 = { A: 'A' };
                var query1 = { A: { $type: 'string' } };
                expect(Yukki.check(data1, query1)).to.be.ok;

                var data2 = { A: true };
                var query2 = { A: { $type: 'boolean' } };
                expect(Yukki.check(data2, query2)).to.be.ok;

                var data3 = { A: [] };
                var query3 = { A: { $type: 'array' } };
                expect(Yukki.check(data3, query3)).to.be.ok;

                var data4 = { A: {} };
                var query4 = { A: { $type: 'object' } };
                expect(Yukki.check(data4, query4)).to.be.ok;

                var data5 = { A: null };
                var query5 = { A: { $type: 'null' } };
                expect(Yukki.check(data5, query5)).to.be.ok;

                var data6 = { A: 10 };
                var query6 = { B: { $type: 'undefined' } };
                expect(Yukki.check(data6, query6)).to.be.ok;
            });

            it('should return false if value not of type as specified', function() {
                var data = { A: 10 };
                var query = { A: { $type: 'string' } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: null };
                var query1 = { A: { $type: 'object' } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;
            });

            it('($type: simple) should return true if value are number or string or boolean', function() {
                var data = { A: 10 };
                var query = { A: { $type: 'simple' } };
                expect(Yukki.check(data, query)).to.be.ok;

                var data1 = { A: 'A' };
                var query1 = { A: { $type: 'simple' } };
                expect(Yukki.check(data1, query1)).to.be.ok;

                var data2 = { A: true };
                var query2 = { A: { $type: 'simple' } };
                expect(Yukki.check(data2, query2)).to.be.ok;
            });

            it('($type: simple) should return false if value are array or object or null', function() {
                var data = { A: [] };
                var query = { A: { $type: 'simple' } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: {} };
                var query1 = { A: { $type: 'simple' } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;

                var data2 = { A: null };
                var query2 = { A: { $type: 'simple' } };
                expect(Yukki.check(data2, query2)).to.not.be.ok;
            });

            it('($type: complex) should return true if value are array or object', function() {
                var data = { A: [] };
                var query = { A: { $type: 'complex' } };
                expect(Yukki.check(data, query)).to.be.ok;

                var data1 = { A: {} };
                var query1 = { A: { $type: 'complex' } };
                expect(Yukki.check(data1, query1)).to.be.ok;
            });

            it('($type: complex) should return false if value are number or string or boolean', function() {
                var data = { A: 10 };
                var query = { A: { $type: 'complex' } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: 'A' };
                var query1 = { A: { $type: 'complex' } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;

                var data2 = { A: true };
                var query2 = { A: { $type: 'complex' } };
                expect(Yukki.check(data2, query2)).to.not.be.ok;

                var data3 = { A: null };
                var query3 = { A: { $type: 'complex' } };
                expect(Yukki.check(data3, query3)).to.not.be.ok;
            });
        });

        describe('$and', function() {
            it('should return true if exists all argument values', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $all: [1, 3, 5] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is not array and argument have one this value', function() {
                var data = { A: 10 };
                var query = { A: { $all: [10] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if argument is an empty array', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $all: [] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if any value does not exists', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $all: [1, 3, 5, 7, 9] } };
                expect(Yukki.check(data, query)).to.not.be.ok;

                var data1 = { A: '1 2 3 4 5 6 7 8 9' };
                var query1 = { A: { $all: [1, 3, 5, 7, 9] } };
                expect(Yukki.check(data1, query1)).to.not.be.ok;
            });

            it('should return false if value is an empty array', function() {
                var data = { A: [] };
                var query = { A: { $all: [1, 3, 5] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$any', function() {
            it('should return true if exists any argument values', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $any: [0, 2, 10] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if value is not array and value in argument', function() {
                var data = { A: 10 };
                var query = { A: { $any: [0, 5, 10] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if argument is an empty array', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $any: [] } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if ot exists all argument values', function() {
                var data = { A: [1, 2, 3, 4, 5] };
                var query = { A: { $any: [10, 20, 30] } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$or', function() {
            it('should return true if any return true', function() {
                var data = { A: 10 };
                var query = { $or: [{ A: 10 }, { B: 20 }] };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if argument is empty array', function() {
                var data = { A: 10 };
                var query = { $or: [] };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if all return false', function() {
                var data = { A: 10 };
                var query = { $or: [{ A: 20 }, { B: 20 }] };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$and', function() {
            it('should return true if all return true', function() {
                var data = { A: 10 };
                var query = { $and: [{ A: 10 }, { $type: 'object' }] };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return true if argument is empty array', function() {
                var data = { A: 10 };
                var query = { $and: [] };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if any return false', function() {
                var data = { A: 10 };
                var query = { $and: [{ A: 10 }, { B: 20 }] };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$position', function() {
            it('should return true if value inside another object at argument', function() {
                var data = { A: { B: 10 } };
                var query = { A: { B: 10, $position: 'A' } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if value inside another object not at argument', function() {
                var data = { A: { B: 10 } };
                var query = { A: { B: 10, $position: 'B' } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$elem_match', function() {
            it('should return true if any value satisfied', function() {
                var data = { A: [{ B: 10 }, { B: 20 }, { C: 20 }] };
                var query = { A: { $elem_match: { B: 20 } } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if all values are not satisfied', function() {
                var data = { A: [{ B: 10 }, { B: 20 }, { C: 20 }] };
                var query = { A: { $elem_match: { C: 30 } } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('should return false if value is an empty array', function() {
                var data = { A: [] };
                var query = { A: { $elem_match: { B: 20 } } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });

            it('should work together with $position', function() {
                var data = { A: [{ B: 10 }, { B: 20 }, { C: 20 }] };
                var query = { A: { $elem_match: { B: 20, $position: 1 } } };
                expect(Yukki.check(data, query)).to.be.ok;
            });
        });

        describe('$child', function() {
            it('should return true if any of children is satisfies', function() {
                var data = { A: { B: 10 } };
                var query = { $child: { B: 10 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if all children is not satisfies', function() {
                var data = { A: { B: 10 } };
                var query = { $child: { B: 20 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$parent', function() {
            it('should return true if parent is satisfies', function() {
                var data = { A: { B: 10 } };
                var query = { A: { B: 10, $parent: { A: { $exists: true } } } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if parent is not satisfies', function() {
                var data = { A: { B: 10 } };
                var query = { A: { B: 10, $parent: { B: { $exists: true } } } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$ancestor', function() {
            it('should return true if any ancestor is satisfies', function() {
                var data = { A: { B: { C: 10 } } };
                var query = { A: { B: { C: 10, $ancestor: { A: { $exists: true } } } } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if all ancestors is not satisfies', function() {
                var data = { A: { B: { C: 10 } } };
                var query = { A: { B: { C: 10, $ancestor: { D: { $exists: true } } } } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });

        describe('$descendant', function() {
            it('should return true if any descendant is satisfies', function() {
                var data = { A: { B: { C: 10 } } };
                var query = { $descendant: { C: 10 } };
                expect(Yukki.check(data, query)).to.be.ok;
            });

            it('should return false if all descendants is not satisfies', function() {
                var data = { A: { B: { C: 10 } } };
                var query = { $descendant: { C: 20 } };
                expect(Yukki.check(data, query)).to.not.be.ok;
            });
        });
    });
});
