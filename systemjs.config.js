/**
 * System configuration for Angular samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    System.config({
        paths: {
            // paths serve as alias
            'npm:': 'node_modules/'
        },
        // map tells the System loader where to look for things
        map: {
            // our app is within the app folder
            app: 'app',
            // angular bundles
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/router/upgrade': 'npm:@angular/router/bundles/router-upgrade.umd.js',
            '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
            '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',
            '@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',
            "@progress/kendo-angular-upload": "npm:@progress/kendo-angular-upload/dist/cdn/js/kendo-angular-upload.js",
            "@progress/kendo-data-query": "npm:@progress/kendo-data-query/dist/cdn/js/kendo-data-query.js",
            "@progress/kendo-file-saver": "npm:@progress/kendo-file-saver/dist/cdn/js/kendo-file-saver.js",
            "@progress/kendo-angular-intl": "npm:@progress/kendo-angular-intl/dist/cdn/js/kendo-angular-intl.js",
            "@progress/kendo-angular-l10n": "npm:@progress/kendo-angular-l10n/dist/cdn/js/kendo-angular-l10n.js",
            "@progress/kendo-angular-inputs": "npm:@progress/kendo-angular-inputs/dist/cdn/js/kendo-angular-inputs.js",
            "@progress/kendo-angular-dateinputs": "npm:@progress/kendo-angular-dateinputs/dist/cdn/js/kendo-angular-dateinputs.js",
            "@progress/kendo-angular-dropdowns": "npm:@progress/kendo-angular-dropdowns/dist/cdn/js/kendo-angular-dropdowns.js",
            "@progress/kendo-angular-grid": "npm:@progress/kendo-angular-grid/dist/cdn/js/kendo-angular-grid.js",
            "@progress/kendo-angular-resize-sensor": "npm:@progress/kendo-angular-resize-sensor/dist/cdn/js/kendo-angular-resize-sensor.js",
            "@progress/kendo-angular-charts": "npm:@progress/kendo-angular-charts/dist/cdn/js/kendo-angular-charts.js",
            "@progress/kendo-angular-dialog": "npm:@progress/kendo-angular-dialog/dist/cdn/js/kendo-angular-dialog.js",
            "@progress/kendo-angular-buttons": "npm:@progress/kendo-angular-buttons/dist/cdn/js/kendo-angular-buttons.js",
            "@progress/kendo-drawing": "npm:@progress/kendo-drawing/dist/cdn/js/kendo-drawing.js",
            '@angular/animations': 'npm:@angular/animations/bundles/animations.umd.js',
            '@angular/animations/browser': 'npm:@angular/animations/bundles/animations-browser.umd.js',
            '@angular/platform-browser/animations': 'npm:@angular/platform-browser/bundles/platform-browser-animations.umd.js',
            'angular2-busy': 'npm:angular2-busy',
            // other libraries
            'rxjs': 'npm:rxjs',
            'angular-in-memory-web-api': 'npm:angular-in-memory-web-api/bundles/in-memory-web-api.umd.js'
        },
        // packages tells the System loader how to load when no filename and/or no extension
        packages: {
            app: {
                main: './main.js',
                defaultExtension: 'js'
            },
            rxjs: {
                defaultExtension: 'js'
            },
            'angular2-busy': {
                main: './index.js',
                defaultExtension: 'js'
            }
        }
    });
})(this);
