# GeoCollab design notes

## Vue约定

在Pinia里，组合式写法 使用ref和shallowRef。参考 [Vue3+pinia踩坑，reactive 与 ref 的区别。 - 掘金](https://juejin.cn/post/7278931167519801381)

viewerRef相当于全局保存的状态。使用shallowRef来避免响应式劫持。部分视图逻辑里，viewer对象更新理应导致视图更新，但是因为使用了shallowRef，这一部分手动编写。cesium相关的大部分手动编写。

其实如果使用shallowRef来创建浅层响应的viewer。那还不如更简单，直接创建new Viewer。把pinia当作一个全局变量的容器。

在composable里，组合式写法 使用ref，reactive，shallowRef，shallowReactive均可

<!-- 本来参考岭南灯火的博客，把业务组件按照插槽的方式插入地图组件内部（这样的好处是可以使用props和 依赖注入 ），但是如果这样的话，业务组件是子组件。即业务组件先 mounted，地图组件后mounted。这样viewer也会后创建。这时，业务组件在mounted的时候不能拿到已经创建好的viewer对象。 -->

## TODO

- [ ] 快速搭建Layer层，简单封装一个图层的官方示例。 cesium官方封装的imageryLayerCollection功能已经很完善，有raise和down。所以类似felt的那种图片插入需要用entity。比较好设置位置。
- [ ] 引入Cesium的creation插件
- [ ] 各组件完善细节，参考blitz
- [ ] 配置项目，eslint这些
- [ ] 封装Cesium自带组件，或者自己创建


## 应用程序设计

### GUI部分

[色卡](https://www.colorhunt.co/palette/e1f0dad4e7c5bfd8af99bc85)

参考 Felt，Figma，blitz，terriajs，excalidraw等

### Cesium部分

在GeoCollab中，可以把数据组织成一类还是两类？左侧图层GUI里是一个数组，可以包含两类的数据。

在Cesium中，添加数据的方法有 `Entity API` 以及 `Primitive API`

- 通过 `viewer.entities.add()`
- 通过 `viewer.dataSources.add(Cesium.GeoJsonDataSource.load(''))`
- 通过 `scene.primitives.add(tileset)`
- 通过 `scene.imageryLayers.add()`
- 通过 `viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();` 或者 `viewer.scene.setTerrain(new Terrain())`

`viewer.entities.add()` 相当于 `viewer.dataSourcesDisplay.defaultDataSources.entities.add()` ，当被 `add` 的时候会触发回调，调用 `viewer.scene.primitives.add()` 。

`viewer.flyTo(target, option)` 的规格：`target` 可以是 The entity, array of entities, entity collection, data source, Cesium3DTileset, point cloud, or imagery layer to view. 

因此总的来说，cesium中使用了 `primitives` （entity, dataSource） 和 `global` （imageryLayers, TerrainLayers） 来管理所有的数据，包括datasources，entity，3dtiles，gltf等。

大多数暴露了接口，可以以此实现自定义的类。

在Cesium中， `Viewer` 是组件, `Scene` 是引擎。自底向上分别是 `Core` -> `Renderer` -> `Scene` -> `DataSources` -> `Widgets` -> `App` 。

关于Cesium部分还可以参考notion里的笔记。

### 需要的组件

## 协同部分 核心层结构

### 组织结构

如果按照图层来组织数据：类似于figma、notion、quill，整个文档是一个树结构：LayerCollection

而数据分为三种部分（还需要参考Cesium和deckgl的组织）

1. 不可变数据（basemap，3dtiles，3dmodel）BackgroundLayer
2. 中间数据 geojson，bimmodel，vector，raster
3. 可变数据 EditorLayer (geojson, marker, img, line, poly)

### 协同内容

LayerCollection的图层顺序，以及内容

可变数据需要协同

用户的点击事件也需要传递，位置需要传递（类似cursor 位置）
