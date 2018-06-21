# async-storage-tree

Use React's [async-storage](https://facebook.github.io/react-native/docs/asyncstorage.html)
to create a tree of objects.

## example

```js
// TODO
```

## install

`npm install async-storage-tree`

## api

- createRoot(obj): Promise

Create a new tree with root `obj`. Will overwrite any existing root object!
(However, will leave old nodes untouched).

- getRoot(): Promise[Object]

Get the root object of the tree. Promise resolves to `Error` if no root node exists.

- getChildren(id): Promise[List[Object]]

Get the children of an object with a given `id`. Returns an empty list if node has no children.

- getParent(id): Promise[Object]

Get the parent of a node with a given `id`.

- createChild(id, obj): Promise

Create `obj` as a new child of the leaf node with a given `id`.