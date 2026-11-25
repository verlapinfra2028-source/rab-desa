'use strict';
const core = require('./core.js'), core2 = require('./core2.js'), out = require('./out.js'), gambar = require('./gambar.js');
function build(spec, opts) {
  const X = core.init(spec, opts);
  core.setupMDP(X); core.setupCover(X); core.setupMaster(X); core2.setupBackup(X); core2.setupHarga(X);
  out.setupAHSP(X); out.makeItems(X); if (spec.dynamic) spec.dynamic(X);
  X.ITEMS = spec.items(X); out.setupTerbilang(X); out.setupSwakelola(X); out.setupRAB(X); out.setupRekap(X); gambar.setup(X);
  X.wb.calcProperties = { fullCalcOnLoad: true };
  return X;
}
module.exports = { build };
