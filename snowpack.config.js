// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    'src/lib': '/js',
    src: '/',
    'src/shaders': { url: '/shaders', static: true }
  },
  plugins: [
    '@snowpack/plugin-typescript'
  ],
  packageOptions: { },
  devOptions: {
    open: 'none',
    output: 'stream'
  },
  buildOptions: {
    sourcemap: true
  },
};
