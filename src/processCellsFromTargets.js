/* global xelib */

module.exports = (helpers, locals) => {
  // create the namespace for the function
  const namespace = {}

  namespace.processCellsFromTargets = (cellsRefs, record) => {
    // if has not objectives, we skip
    if (!xelib.HasElement(record, 'Objectives')) return
    // get all quest objectives
    const objectives = xelib.GetElements(record, 'Objectives')
    // iterate through all objectives
    objectives.forEach(objective => {
      // check if it has targets
      if (xelib.HasElement(objective, 'Targets')) {
        const targets = xelib.GetElements(objective, 'Targets')
        // iterate targets
        targets.forEach(target => {
          // check if has conditions
          if (xelib.HasElement(target, 'Conditions')) {
            const conditions = xelib.GetElements(target, 'Conditions')
            // iterate conditions
            conditions.forEach(condition => {
              // helpers.logMessage(`${xelib.ElementToJSON(condition)}`)
              // get the function
              const func = xelib.GetUIntValue(condition, 'CTDA\\Function')
              // if it's 67 (GetInCell)
              if (func === 67) {
                // get the first parameter (the cell)
                const cell = xelib.GetLinksTo(condition, 'CTDA\\Parameter #1')
                // add the winning override
                cellsRefs.push(xelib.GetWinningOverride(cell))
                // helpers.logMessage(`${xelib.EditorID(record)} => ${xelib.EditorID(cell)}`)
              }
            })
          }
        })
      }
      // helpers.logMessage(`${xelib.EditorID(record)} => ${xelib.ElementToJSON(objective)}`)
    })
  }

  // return it
  return namespace.processCellsFromTargets
}
