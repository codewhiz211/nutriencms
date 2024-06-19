/* Controls the UI state of a table row */
export interface TableRowState {
  /* Apply success class if row's column has any value from the array */
  success: {property?: string, values?: string[]};
  /* Apply fail class if row's column has any value from the array */
  fail: {property?: string, values?: string[]};
}