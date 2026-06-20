module.exports = {
  open: () => ({
    executeAsync: async (query, values) => {
      // basic mock behavior
      if (query && query.toLowerCase().includes('select')) {
        return { results: [] }
      }
      if (query && query.toLowerCase().startsWith('insert')) {
        return { insertId: 1 }
      }
      return {}
    },
    close: () => {},
  }),
}
