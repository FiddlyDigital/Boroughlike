const fs = require('fs-extra');
fs.copySync("./assets", "../../jekyllblog/fiddlydigital.github.io/apps/Boroughlike/assets", { overwrite: true});
fs.copySync("./dist", "../../jekyllblog/fiddlydigital.github.io/apps/Boroughlike/dist", { overwrite: true});
fs.copySync("./pwa", "../../jekyllblog/fiddlydigital.github.io/apps/Boroughlike/pwa", { overwrite: true});
fs.copySync("./index.html", "../../jekyllblog/fiddlydigital.github.io/apps/Boroughlike/index.html", { overwrite: true});