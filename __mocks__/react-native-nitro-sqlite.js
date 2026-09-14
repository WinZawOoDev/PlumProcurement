const executeAsync = async (query) => {
  // basic mock behavior
  if (query && query.toLowerCase().includes('select')) {
    return { results: [] }
  }
  if (query && query.toLowerCase().startsWith('insert')) {
    return { insertId: 1 }
  }
  return {}
}

module.exports = {
  open: () => ({
    executeAsync,
    // Mirrors the library: runs the callback against a transaction-bound
    // executor and rolls back (rejects) when the callback throws.
    transaction: async (callback) =>
      callback({
        executeAsync,
        execute: executeAsync,
        commit: () => ({}),
        rollback: () => ({}),
      }),
    close: () => {},
  }),
}
