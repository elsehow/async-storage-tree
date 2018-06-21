const uuid = require('uuid/v1')

/*


TODO do i need to stringify / parse objects?
TODO stop mutating `asyncStorage` out of scope


nice-to-haves

TODO some of these functions can be performed in (async) parallel!
TODO If `id` of removeChild is `null`, deletes entire tree. 

questions / for your consideration

TODO should there be a getParent() method for id?

*/



//
//   removeFrom([1,2,3,4], 3)
//   > [1,2,4]
//
function _removeFrom (array, item) {
    let index = array.indexOf(item)
    if (index > -1) {
        array.splice(index, 1)
    }
    return array
}


module.exports = function asyncStorageTree (asyncStorage) {

    let SPECIAL_ROOT_KEY = '_TREE_ROOT'

    /* Set obj as the root.
       Any existing items in `asyncStorage` will go untouched.
       Returns a Promise.

       NOTE - If there is an existing root, its children will be orphaned! We
       recommend to .removeChild() first. (If no arguments are passde to
       removeChild(), the whole tree will be removed, including children of the
       root).

       Under the hood, sets an obj to a special key, '_TREE_ROOT' */
    asyncStorage.createRoot = function createRoot (obj) {
        obj.id = SPECIAL_ROOT_KEY
        obj.children = []
        obj.parent = null
        return asyncStorage.setItem(SPECIAL_ROOT_KEY, obj)
    }

    /* Gets root of tree.
       Returns a Promise.

       Under the hood, gets an obj to a special key, '_TREE_ROOT' */
    asyncStorage.getRoot = function getRoot () {
        return asyncStorage.getItem(SPECIAL_ROOT_KEY)
    }


    /* Create `obj` as a new child of the leaf node with a given `id`.
       If `id` is `null`, will create child of the root node.
       Returns a Promise. */
    asyncStorage.createChild = function createChild (newObj, parentId=SPECIAL_ROOT_KEY) {
        // add a unique id to this new `obj`
        newObj.id = uuid()
        newObj.children = newObj.children ? newObj.children : []
        newObj.parent = parentId

        return asyncStorage
        // first, add new obj to the db
            .setItem(newObj.id, newObj)
        // now, update parent of new obj to reflect child key
            .then(_ => {
                return asyncStorage.getItem(parentId)
            })
            .then(parent => {
                parent.children = parent.children.concat(newObj.id)
                return asyncStorage.setItem(parentId, parent)
            })
    }



    /* Get child nodes of the node with given id.
       If no id specified, gets the children of the root node.

       Returns a Promise, which resolves a [] if node has no children. */
    asyncStorage.getChildren = function getChildren (id=SPECIAL_ROOT_KEY) {
        return asyncStorage
            .getItem(id)
            .then(parent => {
                if (parent.children.length > 0)
                    return asyncStorage.multiGet(parent.children)
                return []
            })
    }


    /* Removes child with given `id` and all children. */
    asyncStorage.removeChild = function removeChild (id) {

        function _recursivelyGetChildIds (id) {
            return asyncStorage
                .getItem(id)
                .then(node => {
                    // if there are no chilren
                    if (node.children.length == 0)
                        //  resolve an empty list
                        return Promise.resolve([])
                    let recursiveSteps =
                        // get every child's id
                        node
                        .children
                        .map(_recursivelyGetChildIds)
                    // and the id of this node
                        .concat(Promise.resolve(node.id))
                    // resolve all of these
                    return Promise.all(recursiveSteps)
                })
        }

        // first, update parent
        // get the child in question
        return asyncStorage
            .getItem(id)
        // use it to get the child's parent
            .then(child => {
                return asyncStorage.getItem(child.parent)
            })
        // then update its parent's list of children to remove this child's id.
            .then(parent => {
                parent.children = _removeFrom(parent.children, id)
                return asyncStorage.setItem(parent.id, parent)
            })
        // second, recursively remove all of this child's children
            .then(_ => {
                return _recursivelyGetChildIds(id)
            }).then(ids => {
                return asyncStorage.multiRemove(ids)
            })
        // finally, remove the child itself
            .then(parent => {
                return asyncStorage.removeItem(id)
            })
    }

    return asyncStorage
}
