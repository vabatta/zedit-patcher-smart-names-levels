/* global info, xelib, registerPatcher, patcherUrl, patcherPath */

registerPatcher({
  info: info,
  gameModes: [xelib.gmSSE, xelib.gmTES5],
  settings: {
    label: info.name,
    hide: false,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    defaultSettings: {
      title: info.name,
      skipEmpty: true,
      formulaRangedLeveled: '{name} ({min} ~ {max})',
      formulaDeleveled: '{name} ({min})',
      formulaLeveled: '{name} ({min}+)',
      patchFileName: 'Smart Patch.esp'
    }
  },
  // requiredFiles: [''],
  getFilesToPatch: filenames => {
    return filenames
  },
  execute: (patchFile, helpers, settings, locals) => ({
    initialize: () => {
      // initialize
      // measure the execution time
      locals.start = new Date()
      // initialize the path
      const srcPath = `${patcherPath}/src`
      // load functions
      locals.processCellsFromTargets = require(`${srcPath}/processCellsFromTargets.js`)(helpers, locals)
      locals.processCellsFromScripts = require(`${srcPath}/processCellsFromScripts.js`)(helpers, locals)
      locals.processLocsFromTargets = require(`${srcPath}/processLocsFromTargets.js`)(helpers, locals)
    },
    process: [{
      load: {
        signature: 'QUST',
        filter: record => {
          // get the winning override that has a name
          return false // xelib.IsWinningOverride(record) && xelib.HasElement(record, 'FULL')
        }
      },
      patch: record => {
        // the cells references
        const cellsRefs = []
        // get from objectives targets
        locals.processCellsFromTargets(cellsRefs, record)
        // get from scripts
        // locals.processCellsFromScripts(cellsRefs, record)
        // the locations references
        const locsRefs = []
        // get from objectives targets
        locals.processLocsFromTargets(locsRefs, record)
        // final levels
        const levels = { min: 0, max: 0 }
        // iterate through all cells
        cellsRefs.forEach(cell => {
          // check that has a zone
          if (!xelib.HasElement(cell, 'XEZN')) return
          // get the winning override of the encounter zone
          const eczn = xelib.GetWinningOverride(xelib.GetLinksTo(cell, 'XEZN'))
          // get the min level of the zone
          const min = xelib.GetUIntValue(eczn, 'DATA\\Min Level')
          // the the max level of the zone
          const max = xelib.GetUIntValue(eczn, 'DATA\\Max Level')
          // assign higher only
          if (levels.min < min) levels.min = min
          if (levels.max < max) levels.max = max
        })
        // iterate through all locations
        locsRefs.forEach(location => {
          // helpers.logMessage(`${xelib.EditorID(record)} => ${xelib.EditorID(location)}`)
          // REVIEW based on added content from other patcher
          // get the map marker
          // if (xelib.HasElement(location, 'MNAM')) {
          //   const mapMarker = xelib.GetWinningOverride(xelib.GetLinksTo(location, 'MNAM'))
          //   // check that has a zone
          //   if (!xelib.HasElement(mapMarker, 'XEZN')) return
          //   // get the winning override of the encounter zone
          //   const eczn = xelib.GetWinningOverride(xelib.GetLinksTo(mapMarker, 'XEZN'))
          //   // get the min level of the zone
          //   const min = xelib.GetUIntValue(eczn, 'DATA\\Min Level')
          //   // the the max level of the zone
          //   const max = xelib.GetUIntValue(eczn, 'DATA\\Max Level')
          //   // assign higher only
          //   if (levels.min < min) levels.min = min
          //   if (levels.max < max) levels.max = max
          // }
        })
        // if they are the same without a level, skip
        if (settings.skipEmpty && levels.min === 0 && levels.max === 0) return
        // the name to patch
        let name = xelib.FullName(record)
        // select the appropriate formula
        let formula = settings.formulaLeveled
        if (levels.min < levels.max) formula = settings.formulaRangedLeveled
        else if (levels.min === levels.max) formula = settings.formulaDeleveled
        // replace with actual values
        name = formula.replace(/{name}/g, name)
        name = name.replace(/{min}/g, levels.min)
        name = name.replace(/{max}/g, levels.max)
        // patch it
        // helpers.logMessage(name)
        xelib.SetValue(record, 'FULL', name)
      }
    },
    {
      load: {
        signature: 'CELL',
        filter: record => {
          // get the winning override which, with a name, an encounter zone and that is an interior
          return xelib.IsWinningOverride(record) && xelib.HasElement(record, 'FULL') && xelib.HasElement(record, 'XEZN') && xelib.GetFlag(record, 'DATA', 'Is Interior Cell')
        }
      },
      patch: record => {
        // get the winning override of the encounter zone
        const eczn = xelib.GetWinningOverride(xelib.GetLinksTo(record, 'XEZN'))
        // get the min level of the zone
        const min = xelib.GetUIntValue(eczn, 'DATA\\Min Level')
        // the the max level of the zone
        const max = xelib.GetUIntValue(eczn, 'DATA\\Max Level')
        // if they are the same without a level, skip
        if (settings.skipEmpty && min === 0 && max === 0) return
        // the name to patch
        let name = xelib.FullName(record)
        // select the appropriate formula
        let formula = settings.formulaLeveled
        if (min < max) formula = settings.formulaRangedLeveled
        else if (min === max) formula = settings.formulaDeleveled
        // replace with actual values
        name = formula.replace(/{name}/g, name)
        name = name.replace(/{min}/g, min)
        name = name.replace(/{max}/g, max)
        // patch it
        // helpers.logMessage(name)
        xelib.SetValue(record, 'FULL', name)
      }
    }],
    finalize: () => {
      // log the execution time
      locals.time = new Date() - locals.start
      helpers.logMessage(`Took ${locals.time / 1000} seconds`)
    }
  })
})
