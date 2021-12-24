module.exports = {
  devServer: {
    proxy: {
      "/geoserver": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: {
          "^/geoserver": "/geoserver",
        },
      },
      "/cva_w": {
        target: "http://t0.tianditu.gov.cn",
        changeOrigin: true,
        pathRewrite: {
          "^/cva_w": "/cva_w",
        },
      },
      "/vec_w": {
        target: "http://t0.tianditu.gov.cn",
        changeOrigin: true,
        pathRewrite: {
          "^/vec_w": "/vec_w",
        },
      },
      "/cva_c": {
        target: "http://t0.tianditu.gov.cn",
        changeOrigin: true,
        pathRewrite: {
          "^/cva_c": "/cva_c",
        },
      },
      "/vec_c": {
        target: "http://t0.tianditu.gov.cn",
        changeOrigin: true,
        pathRewrite: {
          "^/vec_c": "/vec_c",
        },
      },
      "/DataServer": {
        target: "http://t0.tianditu.gov.cn",
        changeOrigin: true,
        pathRewrite: {
          "^/DataServer": "/DataServer",
        },
      },
    },
  },
};
