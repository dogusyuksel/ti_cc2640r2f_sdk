/**
 * Created by osohm on 22/07/14.
 */

'use strict';

const fs = require('fs');
const assert = require('chai').assert;

const Rexdb = require('../lib/rexdb.js');

describe('RexDB', function () {
    it('Inserting', function (done) {
        const doc1 = { prop1: 'A', prop2: 'B' };
        const doc2 = { prop1: 'C', prop2: 'A' };
        const doc3 = { prop1: 'A', prop2: 'Z' };
        const collection = new Rexdb();
        collection.insert([doc1], function (err, results) {
            const msg = 'Returned results: ' + JSON.stringify(results);
            assert(err === null, err);
            assert.deepEqual(results[0], doc1, msg);
            assert(results.length === 1, msg);

            collection.insert([doc2, doc3], function (err, results) {
                const msg = 'Returned results: ' + JSON.stringify(results);
                assert(err === null, err);
                assert.deepEqual(results[0], doc1, msg);
                assert.deepEqual(results[1], doc2, msg);
                assert.deepEqual(results[2], doc3, msg);
                assert(results.length === 3, msg);
                done();
            });
        });
    });
    it('Removing all documents', function (done) {
        const doc1 = { prop1: 'A', prop2: 'B' };
        const doc2 = { prop1: 'C', prop2: 'A' };
        const doc3 = { prop1: 'A', prop2: 'Z' };
        const data = [doc1, doc2, doc3];
        const collection = new Rexdb();
        collection._insertSync(data);
        collection.remove({}, function (err) {
            assert(err === null, err);
            collection.find({}, function (err, result) {
                assert(result.length === 0);
                done();
            });
        });
    });
    it('Save and load database', function (done) {
        const doc1 = { prop1: 'A', prop2: 'B' };
        const doc2 = { prop1: 'C', prop2: 'A' };
        const doc3 = { prop1: 'A', prop2: 'Z' };
        const data = [doc1, doc2, doc3];
        try {
            fs.unlinkSync('test.db'); // delete db files
            fs.unlinkSync('test.db.index');
        } catch (e) {}
        const collection = new Rexdb('test.db');
        collection.insert(data, function (err) {
            assert(err == null);
            collection.save(function (err) {
                assert(err == null);
                const collectionLoaded = new Rexdb('test.db');
                collectionLoaded.find({}, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err == null);
                    assert.deepEqual(data, results, msg);
                    assert(results.length === 3);
                    done();
                });
            });
        });
    });
    describe('Queries', function () {
        describe('Find single property', function () {
            it('find all documents that have a property with the specified text', function (done) {
                const doc1 = { prop1: 'A', prop2: 'B' };
                const doc2 = { prop1: 'C', prop2: 'A' };
                const doc3 = { prop1: 'A', prop2: 'Z' };
                const data = [doc1, doc2, doc3];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.find({ prop1: 'A' }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('find first document that has a property with the specified text', function (done) {
                const doc1 = { prop1: 'A', prop2: 'B' };
                const doc2 = { prop1: 'A', prop2: 'Z' };
                const doc3 = { prop1: 'D', prop2: 'E' };
                const doc4 = { prop1: 'F', prop2: 'Z' };
                const data = [doc1, doc2, doc3, doc4];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.findOne({ prop2: 'Z' }, function (err, result) {
                    const msg = 'Returned results: ' + JSON.stringify(result);
                    assert(err === null, err);
                    assert.deepEqual(result, doc2, msg);
                    done();
                });
            });
            it('find number', function (done) {
                const doc1 = { prop1: 1, prop2: 'B' };
                const doc2 = { prop1: 2, prop2: 'A' };
                const doc3 = { prop1: 1, prop2: 'Z' };
                const data = [doc1, doc2, doc3];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.find({ prop1: 1 }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('find boolean', function (done) {
                const doc1 = { prop1: false, prop2: 'B' };
                const doc2 = { prop1: true, prop2: 'A' };
                const doc3 = { prop1: false, prop2: 'Z' };
                const data = [doc1, doc2, doc3];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.find({ prop1: false }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('find documents that have a property that is either null or doesn\'t exist', function (done) {
                const doc1 = { prop1: null, prop2: 'B' };
                const doc2 = { prop1: 'C', prop2: 'A' };
                const doc3 = { prop2: 'Z' };
                const data = [doc1, doc2, doc3];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.find({ prop1: null }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('$in: find documents that have a property that has a specifed value, is null or doesn\'t exist', function (done) {
                const doc1 = { prop1: null, prop2: 'B' };
                const doc2 = { prop1: 'C', prop2: 'A' };
                const doc3 = { prop1: 'C' };
                const doc4 = { prop2: 'Z' };
                const doc5 = { prop2: 'A' };
                const data = [doc1, doc2, doc3, doc4, doc5];
                const collection = new Rexdb();
                collection._insertSync(data);
                collection.find({ prop1: { $in: ['C', null] }, prop2: { $in: ['A', null] } }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc2, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert.deepEqual(results[2], doc5, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
        });

        describe('Find multiple properties', function () {
            const doc1 = { prop1: 'A', prop2: 'B', prop3: 'X' };
            const doc2 = { prop1: 'A', prop2: 'B' };
            const doc3 = { prop1: 'D', prop2: 'B', prop3: 'X' };
            const doc4 = { prop1: 'F', prop2: 'Z' };
            const data = [doc1, doc2, doc3, doc4];
            const collection = new Rexdb();
            collection._insertSync(data);
            it('simple syntax: find all documents that have all properties with the specified text', function (done) {
                collection.find({ prop2: 'B', prop3: 'X' }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('simple syntax: undefined means DON`T CARE', function (done) {
                let val;
                collection.find({ prop2: 'B', prop3: val }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc2, msg);
                    assert.deepEqual(results[2], doc3, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
            it('$and syntax: find all documents that have all properties with the specified text', function (done) {
                collection.find({ $and: [{ prop2: 'B' }, { prop3: 'X' }] }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
        });

        describe('Array properties', function () {
            const doc1 = { prop1: 'A', prop2: [['B', 'X'], ['M', 'X', 'N']] };
            const doc2 = { prop1: 'A', prop2: [['Y']] };
            const doc3 = { prop1: 'D' };
            const doc4 = { prop1: 'A', prop2: [['X']] };
            const doc5 = { prop1: 'F', prop2: ['Z', 'G', 'E', 'F'] };
            const doc6 = { prop1: 'F', prop2: [['Z', 'G'], ['X', 'F']] };
            const data = [doc1, doc2, doc3, doc4, doc5, doc6];
            const collection = new Rexdb();
            collection._insertSync(data);
            it('find all documents that have an array element with the specified string', function (done) {
                collection.find({ prop2: 'X' }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc4, msg);
                    assert.deepEqual(results[2], doc6, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
            it('find all documents that have an array containing ALL specified strings', function (done) {
                collection.find({ $and: [{ prop2: 'X' }, { prop2: 'Z' }] }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc6, msg);
                    assert(results.length === 1, msg);
                    done();
                });
            });
        });

        describe('Find with RegExp', function () {
            const doc1 = { prop1: 'A', prop2: [['B', 'X'], ['M', 'X', 'N']] };
            const doc2 = { prop1: 'A', prop2: [['Y']] };
            const data = [doc1, doc2];
            const collection = new Rexdb();
            collection._insertSync(data);
            it('find all documents that match a RegExp', function (done) {
                collection.find({ prop2: /X/ }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert(results.length === 1, msg);
                    done();
                });
            });
        });

        describe('Text search (tokens are ORed)', function () {
            const doc1 = { prop1: 'A', prop2: 'Boosters are great', prop3: '42' };
            const doc2 = { prop1: 'A', prop2: ['X', 'No packs here'] };
            const doc3 = { prop1: 'D', prop2: 'B', prop3: 42 };
            const doc4 = { prop2: 'Here is something else', prop1: 'A' };
            const data = [doc1, doc2, doc3, doc4];
            const collection = new Rexdb();
            collection._insertSync(data);
            it('should find all docs with prop1 = A and the text booster, pack or here in any other field', function (done) {
                collection.find({ prop1: 'A', $text: { $search: 'booster pack, HERE' } }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc2, msg);
                    assert.deepEqual(results[2], doc4, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
            it('should find all docs with text 42', function (done) {
                collection.find({ $text: { $search: '42' } }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
        });

        it('find all documents', function (done) {
            const doc1 = { prop1: false, prop2: 'B' };
            const doc2 = { prop1: true, prop2: 'A' };
            const doc3 = { prop1: false, prop2: 'Z' };
            const data = [doc1, doc2, doc3];
            const collection = new Rexdb();
            collection._insertSync(data);
            collection.find({}, function (err, results) {
                const msg = 'Returned results: ' + JSON.stringify(results);
                assert(err === null, err);
                assert.deepEqual(results, data, msg);
                assert(results.length === 3, msg);
                done();
            });
        });
    });

    describe('Queries using Index', function () {
        it('find documents that have a property that is either null or doesn\'t exist (null makes it fall back to exhaustive search)', function (done) {
            const doc0 = { prop1: null, prop2: 'B' };
            const doc1 = { prop1: 'C', prop2: 'A' };
            const doc2 = { prop2: 'Z' };
            const data = [doc0, doc1, doc2];
            const indices = { prop1: { 'C': [1] }, prop2: { 'B': [0], 'A': [1], 'Z': [2] } };
            const collection = new Rexdb();
            collection._insertSync(data);
            collection._setIndices(indices);
            collection.find({ prop1: null }, function (err, results) {
                const msg = 'Returned results: ' + JSON.stringify(results);
                assert(err === null, err);
                assert.deepEqual(results[0], doc0, msg);
                assert.deepEqual(results[1], doc2, msg);
                assert(results.length === 2, msg);
                done();
            });
        });
        it('$in: find documents that have a property that has a specifed value, is null or doesn\'t exist (null makes it fall back to exhaustive search)', function (done) {
            const doc0 = { prop1: null, prop2: 'B' };
            const doc1 = { prop1: 'C', prop2: 'A' };
            const doc2 = { prop1: 'C' };
            const doc3 = { prop2: 'Z' };
            const doc4 = { prop2: 'A' };
            const data = [doc0, doc1, doc2, doc3, doc4];
            const indices = { prop1: { 'C': [1, 2] }, prop2: { 'B': [0], 'A': [1, 4], 'Z': [3] } };
            const collection = new Rexdb();
            collection._insertSync(data);
            collection._setIndices(indices);
            collection.find({ prop1: { $in: ['C', null] }, prop2: { $in: ['A', null] } }, function (err, results) {
                const msg = 'Returned results: ' + JSON.stringify(results);
                assert(err === null, err);
                assert.deepEqual(results[0], doc1, msg);
                assert.deepEqual(results[1], doc2, msg);
                assert.deepEqual(results[2], doc4, msg);
                assert(results.length === 3, msg);
                done();
            });
        });

        describe('Find multiple properties', function () {
            const doc0 = { prop1: 'A', prop2: 'B', prop3: 'X' };
            const doc1 = { prop1: 'A', prop2: 'B' };
            const doc2 = { prop1: 'D', prop2: 'B', prop3: 'X' };
            const doc3 = { prop1: 'F', prop2: 'Z' };
            const data = [doc0, doc1, doc2, doc3];
            const indices = {
                prop1: { 'A': [0, 1], 'D': [2], 'F': [3] },
                prop2: { 'B': [0, 1, 2], 'Z': [3] },
                prop3: { 'X': [0, 2] }
            };
            const collection = new Rexdb();
            collection._insertSync(data);
            collection._setIndices(indices);
            it('simple syntax: find all documents that have all properties with the specified text', function (done) {
                collection.find({ prop2: 'B', prop3: 'X' }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc0, msg);
                    assert.deepEqual(results[1], doc2, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
            it('simple syntax: undefined means DON`T CARE (undefined makes it fall back to exhaustive search)', function (done) {
                let val;
                collection.find({ prop2: 'B', prop3: val }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc0, msg);
                    assert.deepEqual(results[1], doc1, msg);
                    assert.deepEqual(results[2], doc2, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
        });

        describe('Array properties', function () {
            const doc0 = { prop1: 'A', prop2: [['B', 'X'], ['M', 'X', 'N']] };
            const doc1 = { prop1: 'A', prop2: [['Y']] };
            const doc2 = { prop1: 'D' };
            const doc3 = { prop1: 'A', prop2: [['X']] };
            const doc4 = { prop1: 'F', prop2: ['Z', 'G', 'E', 'F'] };
            const doc5 = { prop1: 'F', prop2: [['Z', 'G'], ['X', 'F']] };
            const data = [doc0, doc1, doc2, doc3, doc4, doc5];
            const indices = {
                prop1: { 'A': [0, 1, 3], 'D': [2], 'F': [4, 5] },
                prop2: { 'B': [0], 'Z': [4, 5], 'X': [0, 3, 5], 'M': [0], 'N': [0], 'Y': [1],
                    'G': [4, 5], 'E': [4], 'F': [4, 5]  }
            };
            const collection = new Rexdb();
            collection._insertSync(data);
            collection._setIndices(indices);
            it('find all documents that have an array element with the specified string', function (done) {
                collection.find({ prop2: 'X' }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc0, msg);
                    assert.deepEqual(results[1], doc3, msg);
                    assert.deepEqual(results[2], doc5, msg);
                    assert(results.length === 3, msg);
                    done();
                });
            });
            it('find all documents that have an array containing ALL specified strings', function (done) {
                collection.find({ $and: [{ prop2: 'X' }, { prop2: 'Z' }] }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc5, msg);
                    assert(results.length === 1, msg);
                    done();
                });
            });
        });

        describe('Text search (tokens are ANDed)', function () {
            const doc0 = { prop1: 'A', prop2: 'Boosters are great', prop3: '42' };
            const doc1 = { prop1: 'A', prop2: ['X', 'No packs here'] };
            const doc2 = { prop1: 'D', prop2: 'B', prop3: 42 };
            const doc3 = { prop2: 'Here is something else', prop1: 'A' };
            const data = [doc0, doc1, doc2, doc3];
            const indices = {
                prop1: { 'A': [0, 1, 3], 'D': [2] },
                prop2: { 'B': [2], 'Boosters are great': [0], 'X': [1], 'No packs here': [1],
                    'Here is something else': [3] },
                prop3: { '42': [0, 2] },
                search: { 'a': [0, 1, 3], 'boosters': [0], 'are': [0], 'great': [0], '42': [0, 2],
                    'x': [1], 'no': [1], 'packs': [1], 'here': [1, 3], 'd': [2], 'b': [2], 'is': [3],
                    'something': [3], 'else': [3] }
            };
            const collection = new Rexdb();
            collection._insertSync(data);
            collection._setIndices(indices);
            it('should find all docs with prop1 = A and the texts pack and here in any field', function (done) {
                collection.find({ prop1: 'A', $text: { $search: ' pack, HERE' } }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc1, msg);
                    assert(results.length === 1, msg);
                    done();
                });
            });
            it('should find all docs with text 42', function (done) {
                collection.find({ $text: { $search: '42' } }, function (err, results) {
                    const msg = 'Returned results: ' + JSON.stringify(results);
                    assert(err === null, err);
                    assert.deepEqual(results[0], doc0, msg);
                    assert.deepEqual(results[1], doc2, msg);
                    assert(results.length === 2, msg);
                    done();
                });
            });
        });
    });
});
