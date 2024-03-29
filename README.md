<h1 align="center">
    linec
</h1>
<p align="center">
    <a href="https://travis-ci.org/hua1995116/linec"><img src="https://travis-ci.org/hua1995116/linec.svg?branch=master" /></a>
    <a href="https://codecov.io/gh/hua1995116/linec"><img src="https://codecov.io/gh/hua1995116/linec/branch/master/graph/badge.svg" /></a>
    <a href="https://npmcharts.com/compare/linec?minimal=true" rel="nofollow"><img src="https://img.shields.io/npm/dm/linec.svg" style="max-width:100%;"></a>
    <a href="https://www.npmjs.com/package/linec" rel="nofollow"><img src="https://img.shields.io/npm/v/linec.svg" style="max-width:100%;"></a>
    <a href="https://www.npmjs.com/package/linec" rel="nofollow"><img src="https://img.shields.io/npm/l/linec.svg?style=flat" style="max-width:100%;"></a>
</p>

# 安装

```
$ npm install -g linec / cnpm install -g linec

```

# 使用

基础用法
```shell
$ linec
```

导出到html
```shell
$ linec -o
```

# 功能

- 输出空行，实际行数，总行数
- 支持400+语言
- 显示遍历速度
- 显示多种颜色
- 支持导出html
- 自定义统计路径
- 自定义忽略文件/目录


# 参数


Usage: index [options]

  Options:

    -V, --version        output the version number
    -i, --ignore [path]  ignore path | <example> linec -i './dist,./src'
    -p, --path [path]    linec path | <example> linec -p './dist'
    -o, --output         ouput html | <example> linec -o
    -h, --help           output usage information


# 效果图
基础模式

<img src="http://s3.qiufeng.blue/screenshot/linec1.png">

导出后打开html
<img src="http://s3.qiufeng.blue/screenshot/linec2.png">

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018 蓝色的秋风
