# async-storage-tree

Use React's [async-storage](https://facebook.github.io/react-native/docs/asyncstorage.html)
to create a tree of objects.

**WIP** - Use at your own peril!

## install

`npm install async-storage-tree`

## example

```js
// TODO
```

## api

- `createRoot(obj): Promise`

Set obj as the root.
Any existing items in `asyncStorage` will go untouched.

NOTE - If there is an existing root, its children will be orphaned! We
recommend to .removeChild() first. (If no arguments are passde to
removeChild(), the whole tree will be removed, including children of the
root).

- `getRoot(): Promise[Object]`

Gets root of tree, returns a Promise.

- `createChild(obj, parentId): Promise`

Create `obj` as a new child of the leaf node with a given `id`.
If no `id` is specified, will create child of the root node.

- `getChildren(id): Promise[List[Object]]`

Get children of node with `id`.
If no `id` specified, gets the children of the root node.

- `removeChild(id): Promise`

Recursively delete nodes (i.e., id and all children).
*TODO:TEST THIS!* If no `id` specified, will remove the entire tree.
