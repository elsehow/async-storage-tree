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
let grandchildId = null
let grandchild2Id = null

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

test('should be able to create and get children of root node (when id is not specified)', t => {
    t.plan(1)
    asyncTree
        .createChild({ foo: 'bar' })
        .then(_ => {
            return asyncTree.getChildren()
        })
        .then(obj => {
            // save id for this node
            childId = obj[0][1].id
            t.deepEquals(obj[0][1].foo, 'bar')
        })
})

test('should be able to create and get parent of a node with children', t => {
    asyncTree
        .createChild({ wow: 'cool'}, childId)
        .then(_ => {
            return asyncTree.createChild({ que: 'onda'}, childId)
        })
        .then(_ => {
            return asyncTree.getChildren(childId)
        }).then(children => {
            t.deepEquals(children[0][1].wow, 'cool')
            t.deepEquals(children[1][1].que, 'onda')
            // we'll save one of these ids for later
            grandchildId = children[0][1].id
            grandchild2Id = children[1][1].id
            t.end()
        })
})

test("should be able to remove child and, in so doing, update its parent's list of children", t => {
    t.plan(3)
    asyncTree
        .removeChild(grandchildId)
    // check that parent was updated correctly
        .then(_ => {
            return asyncTree.getChildren(childId)
        }).then(children => {
            // parent should have only 1 child remaining!
            t.equals(children.length, 1)
            t.deepEquals(children[0][1].que, 'onda')
            // check that child doesn't exist anymore
            return asyncTree.getItem(grandchildId)
        }).then(obj => {
            t.notOk(obj)
        })
})

test('should be able to remove a child and, in so doing, delete its children', t => {
    asyncTree
        .removeChild(childId)
        .then(_ => {
            // root node should list no children
            return asyncTree.getRoot()
        }).then(root => {
            t.deepEquals(root.children, [])
            // child should not exist
            return asyncTree.getItem(childId)
        }).then(child => {
            t.equals(child, undefined)
            // child's child should not exist
            return asyncTree.getItem(grandchild2Id)
        }).then(child => {
            t.end()
        }).catch(err => {
            console.error('ERR!!!', err)
            t.end()
        })
})

test('getChild should resolve as [] when node has no children', t => {
    t.plan(1)
    asyncTree
        .getChildren()
        .then(children => t.deepEquals(children, []))
})

/* TODO Edge cases */

// getRoot() should resolve as error when there's no root in AsyncStorage

// getChildren() of node with no children should resolve as List[None]

// getParent() of a root node should resolve null

// when removeChildren() does not include id, should remove entire tree

// what should happen when we removeChild() of id with no children?


/* TODO Weird adversarial cases */

// should error to get children of a non-node object

// should error to get parent of a non-node object

// removeChild() should resolve as error if parent doesn't list node as a child
