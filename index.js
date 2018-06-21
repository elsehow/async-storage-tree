const uuid = require('uuid/v1')

module.exports = function asyncStorageTree (asyncStorage) {

    // TODO stringify / parse objects?
    // TODO stop mutating `asyncStorage` out of scope
    // TODO some of these functions can be performed in (async) parallel!

    let SPECIAL_ROOT_KEY = '_TREE_ROOT'

    /* Set obj as the root.
       Returns a Promise.

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



    /*
      Create `obj` as a new child of the leaf node with a given `id`.
      If `id` is `null`, will create child of the root node.
      Returns a Promise.

    */
    asyncStorage.createChild = function createChild (parentId, newObj) {
        // add a unique id to this new `obj`
        newObj.id = uuid()
        newObj.children = newObj.children ? newObj.children : []
        newObj.parent = parentId

        return asyncStorage
        // first, add new obj to the db
            .setItem(newObj.id, newObj)
        // now, update parent of new obj to reflect child key
            .then(_ => {
                return asyncStorage.getItem(parentId ? parentId : SPECIAL_ROOT_KEY)
            })
            .then(parent => {
                parent.children = parent.children.concat(newObj.id)
                return asyncStorage.setItem(parentId, parent)
            })
    }



    asyncStorage.getChildren = function getChildren (id) {
        return asyncStorage
            .getItem(id ? id : SPECIAL_ROOT_KEY)
            .then(parent => {
                if (parent.children.length > 0)
                    return asyncStorage.multiGet(parent.children)
                return []
            })
    }

    function _removeFrom (array, item) {
        let index = array.indexOf(5)
        if (index > -1) {
            array.splice(index, 1)
        }
        return array
    }


    asyncStorage.removeChild = function removeChild (childId) {
        // first, get the child in question
        return asyncStorage
            .getItem(childId)
        // now, get the child's parent
            .then(child => {
                return asyncStorage.getItem(child.parent)
            })
        // now, update the parent's list of children to remove this id
            .then(parent => {
                parent.children = _removeFrom(parent.children, childId)
                return asyncStorage.setItem(parent.id, parent)
            })
        // now, remove the child
            .then(parent => {
                return asyncStorage.removeItem(childId)
            })
    }

    return asyncStorage
}
