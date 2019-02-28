/* global xelib */

module.exports = (helpers, locals) => {
  // create the namespace for the function
  const namespace = {}

  namespace.processCellsFromScripts = (cellsRefs, record) => {
    // if has not scripts, we skip
    if (!xelib.HasElement(record, 'VMAD\\Scripts')) return
    // get all quest scripts
    const scripts = xelib.GetElements(record, 'VMAD\\Scripts')
    // iterate through all scripts
    scripts.forEach(script => {

      // helpers.logMessage(`${xelib.EditorID(record)} => ${xelib.ElementToJSON(objective)}`)
    })
  }

  // return it
  return namespace.processCellsFromScripts
}
