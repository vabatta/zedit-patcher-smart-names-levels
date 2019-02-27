/* global info, xelib, registerPatcher, patcherUrl */

registerPatcher({
  info: info,
  gameModes: [xelib.gmSSE, xelib.gmTES5],
  settings: {
    label: info.name,
    hide: false,
    templateUrl: `${patcherUrl}/partials/settings.html`,
    defaultSettings: {
      title: info.name,
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
    },
    process: [{
      load: {
        signature: 'CELL',
        filter: record => {
          // get the winning override which, with a name, an encounter zone and that is an interior
          return xelib.IsWinningOverride(record) && xelib.HasElement(record, 'FULL') && xelib.HasElement(record, 'XEZN') && xelib.GetFlag(record, 'DATA', 'Is Interior Cell')
        }
      },
      patch: record => {
        // the name to patch
        let name = xelib.FullName(record)
        // get the winning override of the encounter zone
        const eczn = xelib.GetWinningOverride(xelib.GetLinksTo(record, 'XEZN'))
        // get the min level of the zone
        const min = xelib.GetUIntValue(eczn, 'DATA\\Min Level')
        // the the max level of the zone
        const max = xelib.GetUIntValue(eczn, 'DATA\\Max Level')
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
