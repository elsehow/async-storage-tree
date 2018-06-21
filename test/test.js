const test = require('tape')
const MockAsyncStorage = require('mock-async-storage').default
const asyncStorageTree = require('..')


/* Sanity checks */

test('my AsyncStorage mock should be chill', t => {
    t.plan(2)
    let strg = new MockAsyncStorage()
    strg.setItem('key', 'value')
        .then(_ => {
            t.ok(true)
            return strg.getItem('key')
        }).then(obj => {
            t.deepEquals(obj, 'value')
        })
})



/* Expected behavior */

//  a storage we'll uee for all future tests
let asyncStorage = new MockAsyncStorage()
let asyncTree = asyncStorageTree(asyncStorage)
// refs we'll use later
let childId = null
let subChildId = null

test('should be able to create and get a root node', t => {
    t.plan(1)
    asyncTree
        .createRoot({ beep: 'boop' })
        .then(_ => {
            return asyncStorage.getRoot()
        }).then(obj => {
            t.deepEquals(obj, { beep: 'boop', id: '_TREE_ROOT', children: [], parent: null })
        })
})

test('should be able to create and get children of root node (when id is null)', t => {
    t.plan(1)
    asyncTree
        .createChild(null, { foo: 'bar' })
        .then(_ => {
            return asyncTree.getChildren(null)
        })
        .then(obj => {
            // save id for this node
            childId = obj[0][1].id
            t.deepEquals(obj[0][1].foo, 'bar')
        })
})

test('should be able to create and get parent of a node with children', t => {
    asyncTree
        .createChild(childId, { wow: 'cool'})
        .then(_ => {
            return asyncTree.createChild(childId, { que: 'onda'})
        })
        .then(_ => {
            return asyncTree.getChildren(childId)
        }).then(children => {
            t.deepEquals(children[0][1].wow, 'cool')
            t.deepEquals(children[1][1].que, 'onda')
            // we'll save one of these ids for later
            subChildId = children[0][1].id
            t.end()
        })
})

test("should be able to remove child and, in so doing, update its parent's list of children", t => {
    t.plan(3)
    asyncTree
        .removeChild(subChildId)
    // check that parent was updated correctly
        .then(_ => {
            return asyncTree.getChildren(childId)
        }).then(children => {
            // parent should have only 1 child remaining!
            t.equals(children.length, 1)
            t.deepEquals(children[0][1].que, 'onda')
            // check that child doesn't exist anymore
            return asyncTree.getItem(subChildId)
        }).then(obj => {
            t.notOk(obj)
        })
})

// should be able to remove a child and, in so doing, delete its children



/* Edge cases */

// should resolve as error when there's no root in AsyncStorage

// should resolve as List[None] to get children of a node with no children

// should resolve as error to get parent of a root node.

// should resolve as error to remove a child whose parent doesn't list it as a child


/* Weird adversarial cases */

// should error to get children of a non-node object

// should error to get parent of a non-node object

// should error to remove a child that doesn't list that node as a parent
