// build.js
const esbuild = require('esbuild');
const dotenv = require('dotenv');
dotenv.config();

esbuild.build({
    entryPoints: ['src/Posfra.ts'],        // Main TypeScript file
    bundle: true,                          // Bundle dependencies
    minify: true,                          // Minify output for CDN use
    sourcemap: false,                      // Disable sourcemaps for production
    outfile: 'dist/posfra.js',             // Output file
    format: 'iife',                        // IIFE format so it can be used in <script>
    globalName: 'Posfra',                  // Expose code as `window.Posfra`
    target: ['es2017'],                    // Set target environment (adjust as needed)
    platform: 'browser',                   // Optimize for browser usage
    logLevel: 'info',                      // Log build info to console
    define: {
        'API_URL': `'${process.env.API_URL}'`,
        'EMBED_URL': `'${process.env.EMBED_URL}'`,
    }
}).catch(() => process.exit(1));