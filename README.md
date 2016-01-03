## esdoc-plugin-async-to-sync

This plugin copies documentation from the async version of methods to their
sync equivalent, so that you don't have to write the same documentation twice
constantly.

For example:

```js
/**
 * Gets a file from disk.
 *
 * @param {string} file The path to the file
 *
 * @return {Promise<string>} The contents of the file
 */
async function get(file) {
}

function getSync(file) {
}
```

Now becomes to ESDoc as if you had written:

```js
/**
 * Gets a file from disk.
 *
 * @param {string} file The path to the file
 *
 * @return {Promise<string>} The contents of the file
 */
async function get(file) {
}

/**
 * Gets a file from disk.
 *
 * @param {string} file The path to the file
 *
 * @return {string} The contents of the file
 */
function getSync(file) {
}
```

Documentation substitution occurs if:

1. The method name ends in 'Sync'
1. There is a method with the same name sans-'Sync'
1. The sync method doesn't have documentation and the async one does


## How does this work?

`npm install` the package, then add it to your esdoc.json:

```js
{
  // Other stuff...

  "plugins": [
    {"name": "esdoc-plugin-async-to-sync"}
  ],

  // More stuff
}

```


## Does this handle callbacks?

Ugh no, PRs welcome
