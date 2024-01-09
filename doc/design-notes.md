# GeoCollab design notes

## TODO

- [ ] 快速搭建Layer层，简单封装一个图层的官方示例。
- [ ] 引入Cesium的creation插件
- [ ] 各组件完善细节，参考blitz
- [ ] 配置项目，eslint这些
- [ ] 封装Cesium自带组件，或者自己创建


## 应用程序设计

### GUI部分

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
