const registerRouter = require("./backend/router");

module.exports = {
  css: {
    loaderOptions: {
      // sassloader
      sass: {
        // 全局引入变量和 mixin, 这些为非实体css文件(如函数变量)
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  devServer: {
    // app是express的一个实例
    before(app) {
      registerRouter(app);
    }
  },
  configureWebpack: config => {
    // BundleAnalyzerPlugin: 读取输出文件夹（通常是dist）中的stats.json文件，把该文件可视化展现的插件。便于直观地比较各个bundle文件的大小，以达到优化性能的目的。
    // 在执行npm run build --report的时候在process.env.npm中添加属性npm_config_report为true
    if (process.env.npm_config_report) {
      const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
        .BundleAnalyzerPlugin;
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  },
  // 生产环境下关闭SourceMap，规避别人来看源码
  productionSourceMap: false,
  // 默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上，例如 https://www.my-app.com/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/
  publicPath: process.env.NODE_ENV === "production" ? "/music-next/" : "/"
};
