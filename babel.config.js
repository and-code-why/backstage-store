//表示只在发布阶段清除console命令
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
    prodPlugins.push('transform-remove-console')
}

module.exports = {
    "presets": [
        "@vue/cli-plugin-babel/preset"
    ],
    "plugins": [
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
            }
        ],
        //"transform-remove-console" //清除在执行bulid命令期间的console命令
        ...prodPlugins //发布产品时的插件数组
    ]
}